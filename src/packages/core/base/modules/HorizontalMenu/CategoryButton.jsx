import React from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { Paper, Grid, makeStyles } from '@material-ui/core'
import CategoryMenu from './CategoryMenu'

const useStyles = makeStyles(theme => ({
  ButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(6),
    width: theme.spacing(6),
    borderRadius: '50%',

    '&:hover': {
      background: theme.palette.primary.light
    }
  },

  clickableButton: {
    cursor: 'pointer'
  },

  ContainerPadding: {
    padding: theme.spacing(1)
  }
}))

function CategoryButton({ children, pages, path }) {
  const classes = useStyles()
  const history = useHistory()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const [isMenuActive, setIsMenuActive] = React.useState(false)

  function handleClose() {
    if (!isMenuActive) {
      setAnchorEl(null)
    }
  }

  function handleMenuLeave() {
    setIsMenuActive(false)
    setAnchorEl(null)
  }

  function handleMenuEnter() {
    setIsMenuActive(true)
  }

  return (
    <Grid item className={classes.ContainerPadding} onMouseLeave={handleClose}>
      <Paper
        className={classNames(classes.ButtonContainer, {
          [classes.clickableButton]: path
        })}
        onMouseEnter={e => {
          if (pages) {
            setAnchorEl(e.currentTarget)
          }
        }}
        onClick={e => {
          if (path) {
            history.push(path)
          }
        }}
      >
        {children}
        {pages && (
          <CategoryMenu
            pages={pages}
            anchorEl={anchorEl}
            onClose={handleClose}
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          />
        )}
      </Paper>
    </Grid>
  )
}

export default CategoryButton
