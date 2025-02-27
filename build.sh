#!/bin/bash
export DISABLE_ESLINT_PLUGIN=true
export NEXT_TELEMETRY_DISABLED=1
export NEXT_BUNDLE_ESLINT=false
export ESLINT_SKIP_CHECKING=true
npm run build 