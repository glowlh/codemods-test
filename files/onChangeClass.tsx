import * as React from 'react';
import { connect } from 'react-redux';
import Actions from './redux/actions';
import './style.scss';

import { Input } from '@fcc/rbo-ui';
import * as Components from '@fcc/rbo-ui';
import { Select as newSelect } from '@fcc/rbo-ui';

interface INightProps {
    photo?: string;
    onFetchLoad: Function;
}

interface INightState {}

class Night extends React.Component<INightProps, INightState> {

    componentDidMount() {
        this.props.onFetchLoad();
    }

    handleInput = (e: React.FormEvent<HTMLInputElement> | any) => {}

    handleSetPassword(event: React.FormEvent<HTMLInputElement>, data: { value: string }) {
        setPassword(data.value);
    }

    render() {
        return (
            <div className="app-prefix-night">

                <newSelect
                    placeholder='Введите логин'
                    value={login}
                    onChange={(event: React.FormEvent<HTMLInputElement>, data: { value: string }) => setLogin(data.value)}
                    invalid={invalidLogin}
                />

                <Input
                    placeholder='Введите логин'
                    value={login}
                    onChange={this.handleSetPassword}
                    invalid={invalidLogin}
                />

                <Components.Input
                    placeholder='Введите логин'
                    value={login}
                    onChange={this.handleInput}
                    invalid={invalidLogin}
                />

                <div className="app-prefix-night__left">
                    <h1 className="app-prefix-night__title">NIGHT</h1>
                </div>
                <div className="app-prefix-night__right">
                    <div
                        className="app-prefix-image app-prefix-image--full"
                        style={{
                            backgroundImage: `url(${this.props.photo})`,
                        }}
                    />
                </div>
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
