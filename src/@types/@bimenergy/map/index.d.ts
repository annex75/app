declare module '@bimenergy/map' {
  interface IMapboxProps extends React.HTMLAttributes<Element> {
    buildings?: any[];
    updateOnlyOneBuildingId?: string;
    center?: any[];
    height?: string;
    width?: string;
    style?: string;
    token: string;
    zoom?: number;
    markCenter?: boolean;
    onClick?: (...args: any[]) => any;
    onMouseMove?: (...args: any[]) => any;
    onMoveEnd?: (...args: any[]) => any;
    onMouseDown?: (...args: any[]) => any;
    onMouseUp?: (...args: any[]) => any;
    useThreebox?: boolean;
    disableScroll?: boolean;
    disableDrag?: boolean;
    reduce?: any;
    find?: any;
    forEach?: any;
  }
  export default class Mapbox extends React.Component<IMapboxProps, {}> {
    browserSupported: any;
    buildingsParent: any;
    container: any;
    currentIntersected: any;
    forceUpdate: any;
    highlightedFeatures: number;
    highlightedObjects: any[];
    map: any;
    mouseDown: any;
    mouseMove: any;
    raycaster: any;
    selectedFeatures: any[];
    threebox: any;
    userFeatures: any;

    constructor (props: IMapboxProps);
  }
}

