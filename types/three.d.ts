declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Loader, LoadingManager, Group } from 'three';

  export class OBJLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (group: Group) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(data: string): Group;
  }
}
