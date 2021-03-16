import { version } from '../../package.json';
export { version as APP_VERSION };
export const SUPPORTED_VERSIONS = [
  "1.4.0",
  version,
]
export const MAX_EPW_FILE_SIZE = "3 MB";