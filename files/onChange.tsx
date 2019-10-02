/**
 * imports of packages
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { Button, Input, Typography, Link, Select } from '@fcc/rbo-ui';
import { Dispatch } from 'redux'

/**
 * imports of components
 */
import Actions from '../../redux/actions';

/**
 * imports of styles
 */
import * as FieldsComponents from '../../../../assets/styles/fields.styles';
import * as Components from '../sign-up/components/steps/step-login/index.styles';
import * as ClientAreaComponents from '../../index.styles';

/**
 * imports of interfaces and constants
 */
import { FORM_STATUSES, IRegistrationState } from '../../redux/interfaces/store';

const ERROR_TEXT = 'Введите корректное значение';

const SignInView = ({
                      invalidLogin,
                      invalidPassword,
                      history,
                      fetchToken,
                      tokenFormStatus,
                    }: any): JSX.Element => {

  const [login, setLogin] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = (event: React.FormEvent<HTMLInputElement>) => {
    if (tokenFormStatus === FORM_STATUSES.REQUEST) {
      return;
    }

    event.preventDefault();
    fetchToken({
      'password': password,
      'subject': login
    });
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement> | any) => {}

  function handleSetPassword(event: React.FormEvent<HTMLInputElement>, data: { value: string }) {
    setPassword(data.value);
  }

  return (
    <ClientAreaComponents.CardMain as='form' onSubmit={handleSubmit}>
      <Components.Form>
        <Components.Field>
          <FieldsComponents.FieldTitle>Логин</FieldsComponents.FieldTitle>
          <Select
            placeholder='Введите логин'
            value={login}
            onChange={(event: React.FormEvent<HTMLInputElement>, data: { value: string }) => setLogin(data.value)}
            invalid={invalidLogin}
          />
          {
            invalidLogin &&
            <FieldsComponents.FieldErrorMessage>
              {ERROR_TEXT}
            </FieldsComponents.FieldErrorMessage>
          }
        </Components.Field>

        <Input
          placeholder='Введите логин'
          value={login}
          onChange={handleSetPassword}
          invalid={invalidLogin}
        />

        <Components.Field>
          <FieldsComponents.FieldTitle>Пароль</FieldsComponents.FieldTitle>
          <Input
            placeholder='Введите пароль'
            type='password'
            value={password}
            onChange={handleInput}
            invalid={invalidPassword}
          />
          {
            invalidPassword &&
            <FieldsComponents.FieldErrorMessage>
              {ERROR_TEXT}
            </FieldsComponents.FieldErrorMessage>
          }
        </Components.Field>

      </Components.Form>

      <Components.CardButton>
        <Button type='submit' onClick={handleSubmit}>Войти</Button>
      </Components.CardButton>
      <Typography size='s' type='p'>
        Если вы еще не зарегистрировались в систему "Окно заёмщика" - <Link
        onClick={() => { history.push('/?signup') }}
        underline={true}
        size='s'
      >
        пройдите регистрацию
      </Link>
      </Typography>
    </ClientAreaComponents.CardMain>
  )
}

const mapStateToProps = (state: { authorisation: IRegistrationState }) => {
  return {
    tokenFormStatus: state.authorisation.formStatuses.token,
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchToken: (data: any) => dispatch(Actions.fetchToken(data))
  };
}

export const SignIn = connect(mapStateToProps, mapDispatchToProps)(withRouter(SignInView));
