/**
 * @module Users/PasswordResetDialogBox
 * @summary This module exports the PasswordResetDialogBox
 */
import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation, withApollo } from 'react-apollo'
import {
  Button,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Divider,
  TextField
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const GET_USER = gql`
  query userDetail($id: Int!, $clientLoginId: Int!) {
    user: userDetail(clientLoginId: $clientLoginId, loginId: $id) {
      id
      userName
      login {
        username
      }
    }
  }
`

const UPDATE_PASSWORD = gql`
  mutation changeUsernamePassword($newPassword: String!, $loginId: Int!) {
    changeUsernamePassword(newPassword: $newPassword, loginId: $loginId)
  }
`

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  dialogPaper: {
    overflow: 'visible'
  },
  dialogContainer: {
    overflow: 'auto'
  },
  dialogContent: {
    overflow: 'visible'
  },
  input: {
    display: 'flex',
    padding: 0
  },
  valueContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },

  noOptionsMessage: {
    fontSize: 16,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16
  }
})

/**
 * @summary PasswordDialogBox component renders a dialog for password input
 */
class PasswordDialogBox extends React.Component {
  /**
   * @property {string} name The name of the user
   * @property {string} username The username of the user
   * @property {string} password The password entered by the user
   * @property {string} confirmPassword The password confirmation field entered by the user
   */
  state = {
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  }

  /**
   * @function
   * @summary Fetches the user's details
   */
  getUserDetails = async () => {
    const { data } = await this.props.client.query({
      query: GET_USER,
      variables: {
        id: this.props.userId,
        clientLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })

    this.setDetails(data.user)
  }

  /**
   * @function
   * @summary Sets the user details state from the given user details
   */
  setDetails = userDetail => {
    this.setState({
      name: userDetail.userName,
      username: userDetail.login.username
    })
  }

  /**
   * @callback
   * @summary Changes form field values on input
   */
  handleFormChange = e => this.setState({ [e.target.name]: e.target.value })

  /**
   * @callback
   * @summary Saves the new password for the user
   */
  handleSave = async e => {
    e.preventDefault()

    const passwordRegex = /^[a-zA-Z0-9.\-_$@*!]{3,20}$/

    if (!passwordRegex.test(this.state.password)) {
      this.props.openSnackbar('Invalid Password', { type: 'warning' })
      return
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.props.openSnackbar(
        'New password and confirm password should be same',
        { type: 'warning' }
      )
      return
    }

    await this.props.updateUser({
      variables: {
        newPassword: this.state.password,
        loginId: parseInt(this.props.userId, 10)
      }
    })
  }

  /**
   * @summary React component lifecycle called after the component is mounted, fetches user details
   */
  componentDidMount() {
    this.getUserDetails()
  }

  render() {
    const { classes } = this.props

    return (
      <Dialog
        className={classes.root}
        open={this.props.openPasswordDialog}
        onClose={this.props.handleClose('openPasswordDialog')}
        aria-labelledby="form-dialog-title"
        classes={{
          paper: classes.dialogPaper,
          container: classes.dialogContainer
        }}
      >
        <DialogTitle id="form-dialog-title">Reset Password</DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="name"
                value={this.state.name}
                type="text"
                onChange={this.handleFormChange}
                label="Name"
                required
                disabled
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="username"
                disabled
                value={this.state.username}
                type="text"
                onChange={this.handleFormChange}
                label="Username"
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="password"
                value={this.state.password}
                type="text"
                onChange={this.handleFormChange}
                label="New Password"
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="confirmPassword"
                value={this.state.confirmPassword}
                type="text"
                onChange={this.handleFormChange}
                label="Confirm Password"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={6} />
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={this.handleSave} color="primary">
            Save
          </Button>

          <Button
            onClick={this.props.handleClose('openPasswordDialog')}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

PasswordDialogBox.propTypes = {
  classes: PropTypes.object.isRequired
}

/**
 * @param {object} props React component props
 * @summary Wraps the password dialog component with the mutation to update the user password
 */
function WrappedPasswordDialogBox(props) {
  function onSuccess() {
    props.openSnackbar('Edited Password successfully', { type: 'success' })
    props.handleClose('openPasswordDialog')()
  }

  function onError() {
    props.openSnackbar('Failed to edit password details', {
      type: 'error'
    })
  }

  return (
    <Mutation
      mutation={UPDATE_PASSWORD}
      onCompleted={onSuccess}
      onError={onError}
    >
      {updateUser => <PasswordDialogBox updateUser={updateUser} {...props} />}
    </Mutation>
  )
}

export default withStyles(styles)(
  withApollo(withSharedSnackbar(WrappedPasswordDialogBox))
)
