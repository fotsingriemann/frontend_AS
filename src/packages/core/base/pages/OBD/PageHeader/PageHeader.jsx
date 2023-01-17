import React, { Fragment } from 'react'
import { Typography, withStyles } from '@material-ui/core'

const PageHeaderStyles = theme => ({
  header: {
    padding: theme.spacing(2)
  }
})

const PageHeader = withStyles(PageHeaderStyles)(function({
  classes,
  children
}) {
  return (
    <Fragment>
      <Typography variant="h5" className={classes.header}>
        {children}
      </Typography>
    </Fragment>
  )
})

export default PageHeader
