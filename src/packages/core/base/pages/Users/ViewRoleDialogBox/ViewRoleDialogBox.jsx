/**
 * @module Users/ViewRoleDialogBox
 * @summary This module exports the Dialog component to view role
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
	Button,
	withStyles,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Typography
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'

const GET_ROLE = gql`
  query roleDetail($clientLoginId: Int!, $roleName: String!) {
    role: roleDetail(clientLoginId: $clientLoginId, roleName: $roleName) {
      id
      roleName
      assignedFeatures {
        feature {
          featureName
          featureDescription
          costPerAssetPerMonth
        }
        permission
      }
    }
  }
`

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		flexGrow: 1
	}
})

/**
 * @param {object} props React component props
 * @summary ViewRoleDialogBox component show role details in a dialog
 */
function ViewRoleDialogBox(props) {
	const { classes } = props
	return (
		<Query
			query={GET_ROLE}
			variables={{
				roleName: props.roleName,
				clientLoginId: getLoginId()
			}}
		>
			{({ loading, error, data }) => {
				if (loading) return null
				if (error) return `Error!: ${error}`

				const { role } = data

				if (!role) return null

				return (
					<Dialog
						className={classes.root}
						open={props.openRoleViewDialog}
						onClose={props.handleClose('openRoleViewDialog')}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">Role Details</DialogTitle>

						<DialogContent>
							<Grid container spacing={2}>
								<Grid item xs={6}>
									<Typography variant="body1">Role:</Typography>
									<Typography variant="body2">{role.roleName}</Typography>
								</Grid>
							</Grid>
						</DialogContent>

						<DialogActions>
							<Button
								onClick={props.handleClose('openRoleViewDialog')}
								color="primary"
							>
								Close
              </Button>
						</DialogActions>
					</Dialog>
				)
			}}
		</Query>
	)
}

ViewRoleDialogBox.propTypes = {
	classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewRoleDialogBox)
