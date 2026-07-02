#!/usr/bin/env node
import {main} from "../compiler/cli.mjs";

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
