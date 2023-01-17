/**
 * @module Users/NewDialogBox
 * @summary This module exports the Dialog Box component
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, Mutation, withApollo } from 'react-apollo'
import {
  Button,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Divider,
  TextField,
} from '@material-ui/core'
import { emphasize } from '@material-ui/core/styles/colorManipulator'
import ComboBox from '@zeliot/common/ui/ComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const ADD_USER = gql`
  mutation userSignup(
    $username: String!
    $password: String!
    $accountType: String!
    $userName: String!
    $email: String
    $contactNumber: String!
    $clientLoginId: Int!
    $roleId: Int!
    $groupId: Int!
  ) {
    userSignup(
      username: $username
      password: $password
      accountType: $accountType
      userName: $userName
      email: $email
      contactNumber: $contactNumber
      clientLoginId: $clientLoginId
      roleId: $roleId
      groupId: $groupId
    )
  }
`

const GET_GROUPS = gql`
  query allGroupsDetails($clientLoginId: Int!) {
    allGroupsDetails(clientLoginId: $clientLoginId) {
      id
      groupName
    }
  }
`

const GET_ROLES = gql`
  query allRolesDetails($clientLoginId: Int!) {
    allRolesDetails(clientLoginId: $clientLoginId) {
      id
      roleName
    }
  }
`

// username validation
const GET_USERNAME = gql`
  query checkUsername($username: String!) {
    checkUsername(username: $username)
  }
`

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  dialogPaper: {
    overflow: 'visible',
  },
  dialogContainer: {
    overflow: 'auto',
  },
  dialogContent: {
    overflow: 'visible',
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    ),
  },
  noOptionsMessage: {
    fontSize: 16,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
})

/**
 * @summary NewDialogBox component renders a Dialog to create a new user
 */
class NewDialogBox extends React.Component {
  /**
   * @property {string} id The role id
   * @property {string} name The name of the user
   * @property {string?} email The email ID of the user
   * @property {string} contactNumber The contact number of the user
   * @property {string} clientLoginId The login ID of the client
   * @property {string} username The username of the client
   * @property {string} role The role of the user
   * @property {string} group The group assigned to the user
   * @property {string} status The status of the user
   * @property {string} loginId The login ID of the user
   * @property {string} password The password of the user
   */
  state = {
    id: '',
    name: '',
    email: null,
    contactNumber: '',
    clientLoginId: '',
    username: '',
    role: '',
    group: '',
    status: '',
    loginId: '',
    password: '',
  }

  /**
   * @callback
   * @summary Changes the value of the form fields
   */
  handleFormChange = (e) => this.setState({ [e.target.name]: e.target.value })

  /**
   * @callback
   * @summary Changes the value of the given state variable
   */
  handleSelectChange = (name) => (value) => this.setState({ [name]: value })

  /**
   * @callback
   * @summary Creates a new user using the user detail variables
   */
  handleSave = (addUser) => async (e) => {
    e.preventDefault()

    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const phoneRegex = /\+?\d{9,12}$/

    if (
      this.state.userName === '' ||
      this.state.contactNumber === '' ||
      this.state.usrname === '' ||
      this.state.group === '' ||
      this.state.role === ''
    ) {
      this.props.openSnackbar('Please fill all the mandatory fields', {
        type: 'warning',
      })
      return
    }

    if (this.state.email !== null) {
      if (!emailRegex.test(this.state.email)) {
        this.props.openSnackbar('Invalid email', { type: 'warning' })
        return
      }
    }

    if (!phoneRegex.test(this.state.contactNumber)) {
      this.props.openSnackbar(
        'Invalid contact number! Length should be between 9 and 12 ',
        { type: 'warning' }
      )
      return
    }

    const { data, errors } = await addUser({
      variables: {
        userName: this.state.name,
        username: this.state.username,
        email: this.state.email,
        contactNumber: this.state.contactNumber,
        clientLoginId: getLoginId(),
        roleId: this.state.role.value,
        groupId: this.state.group.value,
        password: this.state.password,
        accountType: 'UL',
      },
      errorPolicy: 'all',
    })

    if (data) {
      this.props.openSnackbar('Added a new user', { type: 'success' })
      this.props.handleClose('openNewDialog')()
    } else if (errors) {
      this.props.openSnackbar(errors[0].message, { type: 'error' })
    }
  }

  /**
   * @function
   * @summary Checks the validity of the username
   */
  checkUserNameValidity = async (event) => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{5,32}$/)
    const { data } = await this.props.client.query({
      query: GET_USERNAME,
      variables: {
        username: this.state.username,
      },
    })

    if (data.checkUsername !== 'AVAILABLE') {
      this.props.openSnackbar('User name already exist', { type: 'error' })
    } else if (!regex.test(this.state.username)) {
      this.props.openSnackbar('User name should be between 5-32 characters', {
        type: 'error',
      })
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_ROLES}
        variables={{
          clientLoginId: getLoginId(),
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return null
          if (error) return `Error!: ${error}`
          const { allRolesDetails } = data

          const roles =
            allRolesDetails &&
            allRolesDetails.map((role) => ({
              value: role.id,
              label: role.roleName,
            }))

          return (
            <Query
              query={GET_GROUPS}
              variables={{
                clientLoginId: getLoginId(),
              }}
            >
              {({ loading, error, data }) => {
                if (loading) return null
                if (error) return `Error!: ${error}`
                const { allGroupsDetails } = data
                const groups =
                  allGroupsDetails &&
                  allGroupsDetails.map((group) => ({
                    value: group.id,
                    label: group.groupName,
                  }))

                return (
                  <Mutation mutation={ADD_USER}>
                    {(addUser) => (
                      <Dialog
                        className={classes.root}
                        open={this.props.openNewDialog}
                        onClose={this.props.handleClose('openNewDialog')}
                        aria-labelledby="form-dialog-title"
                        classes={{
                          paper: classes.dialogPaper,
                          container: classes.dialogContainer,
                        }}
                      >
                        <DialogTitle id="form-dialog-title">
                          New User Details
                        </DialogTitle>

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
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextField
                                name="email"
                                value={this.state.email}
                                type="text"
                                onChange={this.handleFormChange}
                                label="Email"
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextField
                                name="contactNumber"
                                value={this.state.contactNumber}
                                type="text"
                                onChange={this.handleFormChange}
                                label="Contact Number"
                                required
                              />
                            </Grid>

                            <Grid item xs={6} />

                            <Grid item xs={12}>
                              <Divider />
                            </Grid>

                            <Grid item xs={6}>
                              <TextField
                                name="username"
                                value={this.state.username}
                                type="text"
                                onChange={this.handleFormChange}
                                label="Username"
                                required
                                onBlur={this.checkUserNameValidity}
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextField
                                name="password"
                                value={this.state.password}
                                type="password"
                                onChange={this.handleFormChange}
                                label="Password"
                                required
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Divider />
                            </Grid>

                            <Grid item xs={6} />
                            <Grid item container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body1">
                                  Select Role
                                </Typography>
                              </Grid>

                              <Grid item xs={6}>
                                <Typography variant="body1">
                                  Select Group
                                </Typography>
                              </Grid>

                              <Grid item xs={6}>
                                <div className={classes.root}>
                                  <ComboBox
                                    items={roles}
                                    itemKey="value"
                                    placeholder="Select Role"
                                    itemToStringKey="label"
                                    isLoading={false}
                                    selectedItem={this.state.role}
                                    onSelectedItemChange={this.handleSelectChange(
                                      'role'
                                    )}
                                  />
                                </div>
                              </Grid>

                              <Grid item xs={6}>
                                <ComboBox
                                  items={groups}
                                  placeholder="Select Group"
                                  itemKey="value"
                                  itemToStringKey="label"
                                  isLoading={false}
                                  selectedItem={this.state.group}
                                  onSelectedItemChange={this.handleSelectChange(
                                    'group'
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </DialogContent>

                        <DialogActions>
                          <Button
                            onClick={this.handleSave(addUser)}
                            color="primary"
                          >
                            Save
                          </Button>

                          <Button
                            onClick={this.props.handleClose('openNewDialog')}
                            color="primary"
                          >
                            Close
                          </Button>
                        </DialogActions>
                      </Dialog>
                    )}
                  </Mutation>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}

NewDialogBox.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withApollo(withSharedSnackbar(NewDialogBox)))
