import React, { Component, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { IDataSetListProps, IDataSetListState } from '../types';

const dataSetListStyles:CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
}

const dataSetCardStyles = {
    maxWidth: "30%",
    minWidth: "150px",
    flex: "1",
    margin: "5px",

}

class DataSetList extends Component<IDataSetListProps, IDataSetListState> {    
    render() {
        const dataIds = Object.keys(this.props.dataSets);
        console.log(dataIds);
        return (
            <div>
                <h1 style={{marginBottom: "0.5em"}}>Datasets</h1>
                <div style={dataSetListStyles}>
                    {
                        dataIds.map(id => {
                            const dataSet = this.props.dataSets[id];
                            return (
                                <div key={id} style={dataSetCardStyles} className="bp3-card bp3-elevation-0 bp3-interactive">
                                    <h5><Link to={`/dataSets/${id}`}>{dataSet.id}</Link></h5>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default DataSetList;

