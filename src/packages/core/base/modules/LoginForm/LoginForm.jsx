/**
 * @module LoginForm
 * @summary This module exports the LoginForm component
 */
import React, { Component } from 'react'
import gql from 'graphql-tag'
import classNames from 'classnames'
import { withApollo } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import {
  Card,
  CardMedia,
  CardActions,
  FormControl,
  FormGroup,
  TextField,
  Grid,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  withStyles,
} from '@material-ui/core'
import { AccountCircle, VpnKey } from '@material-ui/icons'
import { AuthConsumer } from '@zeliot/common/auth'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const LOGIN = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      login {
        loginId
        username
        accountType
        status
      }
    }
  }
`

const styles = {
  LoginFormCard: {
    borderRadius: 5,
    margin: 20,
  },
  LoginFormInput: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  LoginCardMedia: {
    height: 200,
    backgroundSize: 'contain',
    marginTop: 24,
  },
  FullWidth: {
    width: '100%',
  },
  LoginButton: {
    background: 'linear-gradient(98deg, #64b9fc, #2196f3)',
    color: 'white',
  },
  LoginProgressLoader: {
    marginRight: 20,
  },
}

/**
 * @summary LoginForm component renders a form for logging users in
 */
class LoginForm extends Component {
  /**
   * @property {string} username The username entered by the user
   * @property {string} password The password entered by the user
   * @property {string?} errorMessage The error message on failed login
   * @property {boolean} isLoading Whether login is being executed
   */
  state = {
    username: '',
    password: '',
    errorMessage: null,
    isLoading: false,
  }

  /**
   * @function
   * @summary Change form input
   */
  handleInputChange = (e) =>
    this.setState({ [e.target.name]: e.target.value, errorMessage: null })

  /**
   * @function
   * @returns {boolean} Whether username & password are valid inputs
   * @summary Validates that username and password is not empty
   */
  validateCredentials = () =>
    this.state.username !== '' && this.state.password !== ''

  /**
   * @function
   * @summary Makes the login query with the user entered username & password,
   * and either logs in or shows the error message
   */
  login = async (e) => {
    e.preventDefault()

    if (!this.validateCredentials()) {
      this.setState({ errorMessage: 'Invalid credentials!' })
      return
    }

    this.setState({ isLoading: true })

    const response = await this.props.client
      .query({
        query: LOGIN,
        variables: {
          username: this.state.username,
          password: this.state.password,
        },
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.graphQLErrors[0].message,
          isLoading: false,
        })
      })

    if (response && response.data && response.data.login) {
      const { login, token } = response.data.login
      this.setState({ isLoading: false }, async () => {
        this.props.login({
          token,
          loginId: login.loginId,
          username: login.username,
          accountType: login.accountType,
        })
      })
    }
  }

  render() {
    const { username, password, isLoading, errorMessage } = this.state
    const { classes } = this.props

    return (
      <Card className={classes.LoginFormCard} elevation={10}>
        {this.props.logo && (
          <CardMedia
            className={classes.LoginCardMedia}
            image={this.props.logo}
          />
        )}

        <CardActions>
          <Grid item xs={12}>
            <form onSubmit={this.login}>
              <FormControl fullWidth>
                <br />
                <FormGroup className={classes.LoginFormInput}>
                  <TextField
                    autoComplete="username"
                    name="username"
                    value={username}
                    type="text"
                    onChange={this.handleInputChange}
                    placeholder="Username"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                  />
                </FormGroup>

                <br />

                <FormGroup className={classes.LoginFormInput}>
                  <TextField
                    autoComplete="current-password"
                    name="password"
                    value={password}
                    type="password"
                    onChange={this.handleInputChange}
                    placeholder="Password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                  />
                </FormGroup>

                <FormGroup className={classes.LoginFormInput}>
                  <Grid justify="space-between" container alignItems="center">
                    <Grid item xs={8}>
                      {errorMessage && (
                        <Typography variant="caption">
                          {errorMessage === 'CLIENT IS DEACTIVATED'
                            ? 'Error: Client is deactivated'
                            : 'Error: Invalid username or password'}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={4}>
                      {!isLoading ? (
                        <ColorButton
                          variant="contained"
                          type="submit"
                          classes={{
                            root: classNames(
                              classes.FullWidth,
                              classes.LoginButton
                            ),
                          }}
                        >
                          Login
                        </ColorButton>
                      ) : (
                        <CircularProgress
                          className={classes.LoginProgressLoader}
                          thickness={3}
                          size={20}
                        />
                      )}
                    </Grid>
                  </Grid>
                </FormGroup>
              </FormControl>
            </form>
          </Grid>
        </CardActions>
      </Card>
    )
  }
}

export default withRouter(
  withApollo(
    withStyles(styles)((props) => (
      <AuthConsumer>
        {({ authStatus, login }) => (
          <LoginForm {...props} authStatus={authStatus} login={login} />
        )}
      </AuthConsumer>
    ))
  )
)
