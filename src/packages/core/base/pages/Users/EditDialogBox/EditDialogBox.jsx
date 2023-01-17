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
  TextField
} from '@material-ui/core'
import { emphasize } from '@material-ui/core/styles/colorManipulator'
import ComboBox from '@zeliot/common/ui/ComboBox'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const GET_USER = gql`
  query userDetail($id: Int!, $clientLoginId: Int!) {
    user: userDetail(clientLoginId: $clientLoginId, id: $id) {
      id
      userName
      email
      contactNumber
      login {
        loginId
        username
      }
      role {
        id
        roleName
      }
      group {
        id
        groupName
      }
      client {
        loginId
      }
      status
    }
  }
`

const UPDATE_USER = gql`
  mutation updateUserDetail(
    $id: Int!
    $userName: String!
    $email: String
    $contactNumber: String!
    $clientLoginId: Int
    $roleId: Int!
    $groupId: Int!
    $status: Int!
    $loginId: Int!
    $loginUsername: String!
  ) {
    updateUserDetail(
      id: $id
      userName: $userName
      email: $email
      contactNumber: $contactNumber
      clientLoginId: $clientLoginId
      roleId: $roleId
      groupId: $groupId
      status: $status
      loginId: $loginId
      loginUsername: $loginUsername
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
  query checkUsername($username: String!, $id: Int) {
    checkUsername(username: $username, loginId: $id)
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
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    )
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
 * @summary EditDialogBox component renders a Dialog to edit a user
 */
class EditDialogBox extends React.Component {
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
    email: '',
    contactNumber: '',
    clientLoginId: '',
    username: '',
    role: null,
    group: '',
    status: '',
    loginId: ''
  }

  /**
   * @function
   * @summary Fetches user details
   */
  getUserDetails = async () => {
    const { data } = await this.props.client.query({
      query: GET_USER,
      variables: {
        id: this.props.id,
        clientLoginId: getLoginId()
      },
      fetchPolicy: 'network-only'
    })

    this.setDetails(data.user)
  }

  /**
   * @function
   * @param {object} userDetail The user details to be set
   * @summary Sets the state with the given user details
   */
  setDetails = userDetail => {
    this.setState({
      id: userDetail.id,
      name: userDetail.userName,
      email: userDetail.email,
      contactNumber: userDetail.contactNumber,
      clientLoginId: userDetail.client.loginId,
      username: userDetail.login.username,
      role: { value: userDetail.role.id, label: userDetail.role.roleName },
      group: { value: userDetail.group.id, label: userDetail.group.groupName },
      status: userDetail.status,
      loginId: userDetail.login.loginId
    })
  }

  /**
   * @callback
   * @summary Changes the value of the form fields
   */
  handleFormChange = e => this.setState({ [e.target.name]: e.target.value })

  /**
   * @callback
   * @summary Changes the value of the given state variable
   */
  handleSelectChange = name => value => this.setState({ [name]: value })

  /**
   * @callback
   * @summary Creates a new user using the user detail variables
   */
  handleSave = updateUser => async e => {
    e.preventDefault()

    const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    const phoneRegex = /\+?\d{9,12}$/

    if (this.state.email !== '') {
      if (!emailRegex.test(this.state.email)) {
        this.props.openSnackbar('Invalid email', { type: 'warning' })
        return
      }
    }

    if (!phoneRegex.test(this.state.contactNumber)) {
      this.props.openSnackbar('Invalid contact number!! Length should be between 9 to 12', { type: 'warning' })
      return
    }

    if (this.state.email === '') {
      this.setState({ email: null })
    }

    if (
      this.state.userName === '' ||
      this.state.contactNumber === '' ||
      this.state.usrname === '' ||
      this.state.group === '' ||
      this.state.role === ''
    ) {
      this.props.openSnackbar('Please fill all the mandatory fields', {
        type: 'warning'
      })
      return
    }

    const { data, errors } = await updateUser({
      variables: {
        id: this.state.id,
        userName: this.state.name,
        email: this.state.email,
        contactNumber: this.state.contactNumber,
        clientLoginId: this.state.clientLoginId,
        roleId: this.state.role.value,
        groupId: this.state.group.value,
        status: this.state.status,
        loginId: this.state.loginId,
        loginUsername: this.state.username
      },
      errorPolicy: 'all'
    })

    if (data) {
      this.props.openSnackbar('Edited user successfully', { type: 'success' })
      this.props.handleClose('openEditDialog')()
    } else if (errors) {
      this.props.openSnackbar(errors[0].message, { type: 'error' })
    }
  }

  /**
   * @function
   * @summary Checks the validity of the username
   */
  checkUserNameValidity = async event => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{5,32}$/)
    const { data } = await this.props.client.query({
      query: GET_USERNAME,
      variables: {
        username: this.state.username,
        id: parseInt(this.state.loginId, 10)
      }
    })
    if (data.checkUsername !== 'AVAILABLE') {
      this.props.openSnackbar('User name already exist', { type: 'error' })
    } else if (!regex.test(this.state.username)) {
      this.props.openSnackbar('User name should be between 5-32 characters', {
        type: 'error'
      })
    }
  }

  /**
   * @function
   * @summary React component lifecyle method called after the component mounts
   */
  componentDidMount() {
    this.getUserDetails()
  }

  render() {
    const { classes } = this.props

    return (
      <Query
        query={GET_ROLES}
        variables={{
          clientLoginId: getLoginId()
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return null
          if (error) return `Error!: ${error}`

          const roles = data.allRolesDetails.map(role => ({
            value: role.id,
            label: role.roleName
          }))

          return (
            <Query
              query={GET_GROUPS}
              variables={{
                clientLoginId: getLoginId()
              }}
            >
              {({ loading, error, data }) => {
                if (loading) return null
                if (error) return `Error!: ${error}`

                const groups = data.allGroupsDetails.map(group => ({
                  value: group.id,
                  label: group.groupName
                }))

                return (
                  <Mutation mutation={UPDATE_USER}>
                    {updateUser => (
                      <Dialog
                        className={classes.root}
                        open={this.props.openEditDialog}
                        onClose={this.props.handleClose('openEditDialog')}
                        aria-labelledby="form-dialog-title"
                        classes={{
                          paper: classes.dialogPaper,
                          container: classes.dialogContainer
                        }}
                      >
                        <DialogTitle id="form-dialog-title">
                          Edit User Details
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
                            onClick={this.handleSave(updateUser)}
                            color="primary"
                          >
                            Save
                          </Button>

                          <Button
                            onClick={this.props.handleClose('openEditDialog')}
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

EditDialogBox.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withApollo(withSharedSnackbar(EditDialogBox)))
