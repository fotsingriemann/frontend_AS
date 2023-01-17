/**
 * @module Immobilize
 * @summary This module exports the page with immobilization settings
 */

import React from 'react'
import ImmobilizeModule from '@zeliot/core/base/modules/ImmobilizeModule'

import { withStyles, Grid, Typography, Divider } from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

/**
 * @param {object} props React component props
 * @summary Immobilize page includes the module for immobilization settings
 */
function Immobilize(props) {
  const { classes } = props

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography
                variant="h5"
                className={classes.textLeft}
                gutterBottom
              >
                {languageJson[props.selectedLanguage].mobilizePage.pageTitle}
              </Typography>
            </Grid>
          </Grid>

          <Divider />
        </Grid>

        <Grid item xs={12}>
          <ImmobilizeModule
            languageJson={languageJson}
            selectedLanguage={props.selectedLanguage}
          />
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(style)(withLanguage(Immobilize))
