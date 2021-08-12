// Needs to be the first thing that happens
// Registers the import aliases
import 'module-alias/register';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import argparse from 'argparse';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

import config from '@common/config';
import logger from '@common/logging';

import SongData from '@db/schema/song-data';

class Importer {
  private parser: argparse.ArgumentParser;
  private bar: cliProgress.SingleBar;

  constructor() {
    this.parser = this.createArgumentParser();
    this.bar = new cliProgress.SingleBar(
      {
        stopOnComplete: true,
      },
      cliProgress.Presets.shades_classic
    );
    this.bar.on('stop', () => this.exit(0));
  }

  private createArgumentParser(): argparse.ArgumentParser {
    const parser = new argparse.ArgumentParser({
      description: 'Argparse example',
    });

    parser.add_argument('directory', {
      type: String,
      help: 'The path to the directory where the songs data json files are stored',
    });

    parser.add_argument('--clean', {
      action: argparse.BooleanOptionalAction,
      help: 'Wether the database will be cleared before the import',
    });

    return parser;
  }

  private connect(callback: () => void): void {
    const connection = mongoose.connection;
    connection.on('connected', async () => {
      logger.info('Mongo Connection Established');

      callback();
    });

    connection.on('disconnected', () => {
      logger.info('Mongo Connection Disconnected');
    });

    mongoose.connect(config.mongodb.uri, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  }

  private exit(code: number): void {
    mongoose.disconnect().then(() => {
      process.exit(code);
    });
  }

  private import(json: any): void {
    const songdata = new SongData(json);
    songdata
      .save()
      .catch((error) => {
        console.error(error);
        this.bar.increment();
      })
      .then(() => this.bar.increment());
  }

  public importDirectory(directory_path: string): void {
    logger.info(chalk.white.bold(`Importing SongData from ${directory_path}`));
    fs.promises
      .readdir(directory_path)
      .catch(console.error)
      .then(async (files: string[]) => {
        this.bar.start(files.length, 0);
        files.forEach((file) => {
          this.importFile(path.join(directory_path, file));
        });
      });
  }

  public importFile(file_path: string): void {
    fs.promises
      .readFile(file_path, { encoding: 'utf8' })
      .catch(console.error)
      .then((content: string) => {
        const json = JSON.parse(content);
        this.import(json);
      });
  }

  public startImport(): void {
    this.connect(async () => {
      const args = this.parser.parse_args();

      const clean = args.clean;
      if (clean) {
        logger.info(chalk.red.bold('SongData collection will be whiped...'));
        await SongData.deleteMany({}).exec();
      }

      const directory_path = path.join(process.cwd(), args.directory);
      this.importDirectory(directory_path);
    });
  }
}

new Importer().startImport();
