#!/usr/bin/env node

import { Command } from "commander";
import { createGenerateCommand } from "./commands/generate.command.js";

const program = new Command();

program
  .name("codexa")
  .description("Code generation toolkit for OpenAPI-based APIs")
  .version("0.1.0");

program.addCommand(createGenerateCommand());

program.parse();