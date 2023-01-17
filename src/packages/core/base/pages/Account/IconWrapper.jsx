/**
 * @module Account/IconWrapper
 * @summary This module exports the IconWrapper component
 */
import React from 'react'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  iconWrapper: {
    display: 'inline-flex',
    verticalAlign: 'middle',
    padding: theme.spacing(1)
  }
}))

/**
 * @param {object} props The react component props
 * @summary IconWrapper component inlines an Icon and adds padding around it
 */
function IconWrapper({ children }) {
  const classes = useStyles()

  return <span className={classes.iconWrapper}>{children}</span>
}

export default IconWrapper
