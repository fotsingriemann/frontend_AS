/**
 * @module Users/EditRole
 * @summary This module exports the component for editing the role
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation, withApollo } from 'react-apollo'
import { Link, Switch, Route } from 'react-router-dom'
import {
  Button,
  withStyles,
  Paper,
  Grid,
  Typography,
  Divider,
  TextField,
  Radio
} from '@material-ui/core'
import { PrivateRoute } from '@zeliot/common/router'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import Users from '../Users'

const GET_ROLE = gql`
  query roleDetail($clientLoginId: Int!, $roleName: String!) {
    role: roleDetail(clientLoginId: $clientLoginId, roleName: $roleName) {
      id
      roleName
    }
  }
`

const GET_ROLE_DETAILS = gql`
  query allFeatureRoleAssignDetails($roleId: Int) {
    features: allFeatureRoleAssignDetails(roleId: $roleId) {
      feature {
        id
        featureName
      }
      permission
    }
  }
`

const ALL_ROLES = gql`
  query allRolesDetails($clientLoginId: Int!) {
    allRolesDetails(clientLoginId: $clientLoginId) {
      id
      roleName
    }
  }
`

const GET_CLIENT_PLAN = gql`
  query clientDetail($loginId: Int) {
    clientDetail(loginId: $loginId) {
      clientName
      plan {
        id
        planName
        description
      }
    }
  }
`

const GET_CLIENT_FEATURES = gql`
  query getPlans($id: Int!) {
    getPlans(id: $id) {
      featureList {
        id
        featureName
      }
    }
  }
`

const ADD_ROLE = gql`
  mutation addRoles($clientLoginId: Int!, $roleName: String!) {
    addRoles(clientLoginId: $clientLoginId, roleName: $roleName)
  }
`

const ADD_FEATURES = gql`
  mutation addFeatureRoleAssignDetail(
    $roleId: Int!
    $featureRoleAssignList: [FeatureRoleAssignInput!]
  ) {
    addFeatureRoleAssignDetail(
      roleId: $roleId
      featureRoleAssignList: $featureRoleAssignList
    )
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(1),
    flexGrow: 1
  }
})

/**
 * @summary EditRole component allows editing a role
 */
class EditRole extends React.Component {
  /**
   * @property {string} roleName The name of the role
   * @property {boolean} roleNameValidated Boolean flag to indicate whether role name is validated
   * @property {object} featureIdPermission The permissions for the feature Id
   * @property {object[]} featureList The list of features
   * @property {string} errorMessage The error message
   * @property {boolean} isError Whether creation of role resulted in an error
   */
  state = {
    roleName: this.props.match.params.roleName,
    roleNameValidated: true,
    featureIdPermission: {},
    featureList: [],
    errorMessage: '',
    isError: false
  }

  /**
   * @callback
   * @summary Handle change event handler
   */
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
      roleNameValidated: false,
      isError: false,
      errorMessage: 'Enter a unique role name and verify'
    })
  }

  /**
   * @callback
   * @summary Sets the permissions change
   */
  handlePermissionChange = featureId => e => {
    const tempPermissions = this.state.featureIdPermission
    tempPermissions[featureId] = e.target.value
    this.setState({ featureIdPermission: tempPermissions })
  }

  /**
   * @function
   * @summary Validates rolename
   */
  validateRoleName = async e => {
    const { data } = await this.props.client.query({
      query: ALL_ROLES,
      variables: {
        clientLoginId: getLoginId()
      }
    })

    const roleNames = []

    data.allRolesDetails.forEach(role => {
      roleNames.push(role.roleName.toLowerCase())
    })

    if (!this.state.roleName) {
      this.setState({
        roleNameValidated: false,
        isError: true,
        errorMessage: 'Cannot be Empty!'
      })
    } else if (roleNames.indexOf(this.state.roleName.toLowerCase()) !== -1) {
      this.setState({
        roleNameValidated: false,
        isError: true,
        errorMessage: 'Already Exists'
      })
    } else {
      this.setState({
        roleNameValidated: true,
        isError: false,
        errorMessage: 'Valid Role Name'
      })
    }
  }

  /**
   * @callback
   * @summary Cancels the creation of a new role
   */
  handleCancel = e => {
    this.setState({
      roleName: '',
      roleNameValidated: false,
      errorMessage: 'Enter a unique role name and verify',
      isError: false
    })
  }

  /**
   * @callback
   * @summary Edits a role by calling the mutation
   */
  handleSave = addRole => async e => {
    e.preventDefault()

    const idPermission = this.state.featureIdPermission
    const featureArray = this.state.featureList
    let isNull = false

    let tempPermissionObject = {}
    const tempFeatureList = []

    featureArray.forEach(feature => {
      tempPermissionObject.featureId = feature.id
      tempPermissionObject.permission = idPermission[feature.id]
      tempFeatureList.push(tempPermissionObject)
      tempPermissionObject = {}
    })

    tempFeatureList.forEach(feature => {
      if (feature.permission === '') {
        isNull = true
        return null
      }
    })

    if (isNull === true) {
      alert('Edit or view has to be selected for all features!')
    } else {
      // TODO: Check the result of mutation and take action accordingly
      const { data, errors } = await this.props.client.query({
        query: GET_ROLE,
        variables: {
          roleName: this.state.roleName,
          clientLoginId: getLoginId()
        }
      })

      // TODO: Update role features mutation here
      const { errors: mutationErrors } = await this.props.client.mutate({
        mutation: ADD_FEATURES,
        variables: {
          roleId: data.role.id,
          featureRoleAssignList: tempFeatureList
        }
      })

      if (errors || mutationErrors) {
        this.props.openSnackbar('Failed to update role', { type: 'error' })
      } else {
        this.props.openSnackbar('Updated role successfully', {
          type: 'success'
        })
      }
    }
  }

  /**
   * @function
   * @summary Fetches a role ID be role name
   */
  getRoleId = async () => {
    const { data } = await this.props.client.query({
      query: GET_ROLE,
      variables: {
        roleName: this.state.roleName,
        clientLoginId: getLoginId()
      }
    })

    this.getRoleDetails(data.role.id)
  }

  /**
   * @function
   * @summary Fetches the role details by role ID
   */
  getRoleDetails = async roleId => {
    const { data } = await this.props.client.query({
      query: GET_ROLE_DETAILS,
      variables: {
        roleId: roleId
      }
    })

    if (data) {
      this.setDetails(data.features)
    }
  }

  /**
   * @function
   * @summary Fetches the plan for the client
   */
  getPlan = async () => {
    const { data } = await this.props.client.query({
      query: GET_CLIENT_PLAN,
      variables: {
        loginId: getLoginId()
      }
    })

    await this.getFeatures(data.clientDetail.plan.id)
  }

  /**
   * @function
   * @summary Fetches the features for the given plan ID
   */
  getFeatures = async planId => {
    const { data } = await this.props.client.query({
      query: GET_CLIENT_FEATURES,
      variables: {
        id: planId
      }
    })

    const featureList = data.getPlans.featureList
    const temp = {}

    featureList.forEach(feature => {
      temp[feature.id] = ''
    })

    return new Promise((resolve, reject) => {
      this.setState(
        {
          featureIdPermission: temp,
          featureList: featureList
        },
        resolve
      )
    })
  }

  /**
   * Fetches the plan and the role details
   * @summary React component lifecycle method called after the component mounts
   */
  async componentDidMount() {
    await this.getPlan()
    this.getRoleId()
  }

  /**
   * @function
   * @summary Sets the features list selection
   */
  setDetails = features => {
    const permissions = {}
    const featureList = []
    let tempObject = {}
    features.forEach(customFeature => {
      tempObject = {}
      permissions[customFeature.feature.id] = customFeature.permission
      tempObject.id = customFeature.feature.id
      tempObject.featureName = customFeature.feature.featureName
      featureList.push(tempObject)
    })

    this.setState({
      featureIdPermission: permissions,
      featureList: featureList
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Mutation mutation={ADD_ROLE}>
        {addRole => (
          <div className={classes.root}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5">Edit Role</Typography>
              </Grid>
              <Grid item container spacing={2} alignItems="center" xs={12}>
                <Grid item>
                  <TextField
                    name="roleName"
                    label="Role Name"
                    value={this.state.roleName}
                    onChange={this.handleChange}
                    disabled
                    error={this.state.isError}
                    helperText={this.state.errorMessage}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {this.state.roleNameValidated === true && (
                <Grid item container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Feature List</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper square className={classes.paper}>
                      <Grid container>
                        <Grid item xs={4}>
                          <Typography variant="body2">FEATURE</Typography>
                        </Grid>

                        <Grid item xs={2}>
                          <Typography variant="body2">YES</Typography>
                        </Grid>

                        <Grid item xs={2}>
                          <Typography variant="body2">NO</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      {this.state.featureList.map(feature => {
                        return (
                          <Grid item xs={12} key={feature.featureName}>
                            <Paper
                              square
                              elevation={0}
                              className={classes.paper}
                            >
                              <Grid container alignItems="center">
                                <Grid item xs={4}>
                                  <Typography variant="body2">
                                    {feature.featureName}
                                  </Typography>
                                </Grid>

                                <Grid item xs={2}>
                                  <Radio
                                    color="primary"
                                    checked={
                                      this.state.featureIdPermission[
                                        feature.id
                                      ] === 'VIEW'
                                    }
                                    onChange={this.handlePermissionChange(
                                      feature.id
                                    )}
                                    value="VIEW"
                                    name="viewRadioButton"
                                    aria-label="View"
                                  />
                                </Grid>

                                <Grid item xs={2}>
                                  <Radio
                                    color="primary"
                                    checked={
                                      this.state.featureIdPermission[
                                        feature.id
                                      ] === 'EDIT'
                                    }
                                    onChange={this.handlePermissionChange(
                                      feature.id
                                    )}
                                    value="EDIT"
                                    name="viewRadioButton"
                                    aria-label="Edit"
                                  />
                                </Grid>
                              </Grid>
                            </Paper>

                            <Grid item xs={12}>
                              <Divider />
                            </Grid>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    container
                    spacing={2}
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item>
                      <Button
                        color="primary"
                        variant="text"
                        onClick={this.handleSave(addRole)}
                      >
                        Update
                      </Button>
                    </Grid>

                    <Grid item>
                      <Button
                        component={Link}
                        color="primary"
                        variant="text"
                        to="/home/manage-users"
                      >
                        Back
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </div>
        )}
      </Mutation>
    )
  }
}

EditRole.propTypes = {
  classes: PropTypes.object.isRequired
}

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/manage-users/edit/:roleName"
      component={withStyles(styles)(withApollo(withSharedSnackbar(EditRole)))}
    />

    <Route exact path="/home/manage-users/" component={Users} />
  </Switch>
)
