/**
 * @module Users/RoleDetails
 * @summary This module exports the component for roles management
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  withStyles,
  IconButton,
} from '@material-ui/core'
import { Edit as EditIcon } from '@material-ui/icons'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_ROLES = gql`
  query allRolesDetails($clientLoginId: Int!) {
    roles: allRolesDetails(clientLoginId: $clientLoginId) {
      id
      roleName
    }
  }
`

const styles = (theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  bigAvatar: {
    width: 60,
    height: 60,
  },
  button: {
    margin: theme.spacing(1),
  },
  listItem: {
    width: '100%',
    textAlign: 'left',
  },
})

/**
 * @param {object} props React component props
 * @summary Shows a list of roles
 */
function RoleDetails(props) {
  const { classes, handleEdit, handleView, selectedLanguage } = props

  return (
    <div className={classes.root}>
      <Query
        query={GET_ROLES}
        variables={{
          clientLoginId: getLoginId(),
        }}
        fetchPolicy="cache-and-network"
      >
        {({ loading, error, data }) => {
          if (loading) return null
          if (error) return `Error!: ${error}`
          const { roles } = data
          return (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {
                      languageJson[selectedLanguage].usersPage.roles
                        .rolesTableColumn
                    }
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {roles &&
                  roles.map((role) => (
                    <TableRow onClick={handleView(role.roleName)}>
                      <TableCell>{role.roleName}</TableCell>
                      <TableCell>
                        <IconButton
                          variant="text"
                          color="primary"
                          className={classes.button}
                          onClick={handleEdit(role.roleName)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )
        }}
      </Query>
    </div>
  )
}

RoleDetails.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withLanguage(withStyles(styles)(RoleDetails))
