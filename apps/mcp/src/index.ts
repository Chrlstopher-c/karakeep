#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMcpServer } from "./shared";

import "./assets.ts";
import "./bookmarks.ts";
import "./highlights.ts";
import "./lists.ts";
import "./quotes.ts";
import "./tags.ts";
import "./uploads.ts";

serveStdio(createMcpServer);
