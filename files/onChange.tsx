import * as React from 'react';
import { connect } from 'react-redux';
import Actions from './redux/actions';
import './style.scss';

import { Drum } from '../drum';
import * as AllDrum from '../drum';
import { Drum as newDrum } from '../drum';

interface INightProps {
  photo?: string;
  onFetchLoad: Function;
}

interface INightState {}

class Night extends React.Component<INightProps, INightState> {

  componentDidMount() {
    this.props.onFetchLoad();
  }

  handleOne = (temp: React.FormEvent<HTMLInputElement>) => {}

  handleTwo(temp: React.FormEvent<any>) {}

  render() {
    return (
      <div className="app-prefix-night">
      <Drum
        onChange={(temp: React.FormEvent<HTMLInputElement>) => console.log(temp)}
      />

      <newDrum
        onChange={this.handleOne}
      />

      <Drum
        onChange={this.handleTwo}
      />
    </div>
  );
  }
}

export default connect(
  (state: any) => ({
    photo: state.night.photo,
  }),
  (dispatch: Function) => ({
    onFetchLoad: () => dispatch(Actions.fetchLoad()),
  }),
)(Night);
