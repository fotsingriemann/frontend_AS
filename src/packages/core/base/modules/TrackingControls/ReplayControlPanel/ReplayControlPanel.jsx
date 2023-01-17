import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseArrowIcon from '@material-ui/icons/Pause'
import {
  withStyles,
  Button,
  Fab,
  Tooltip,
  Menu,
  Grid,
  MenuItem,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const styles = (theme) => ({
  fab: {
    margin: theme.spacing(2),
  },
  catchAllEvents: {
    pointerEvents: 'all',
  },
  rightPadding: {
    paddingRight: 20,
  },
})

class ReplayControlPanel extends React.Component {
  state = {
    anchorEl: null,
  }

  static propTypes = {
    classes: PropTypes.object.isRequired,
    togglePlay: PropTypes.bool.isRequired, // true: Play, false: Pause
    speed: PropTypes.number.isRequired,
    onPlayPause: PropTypes.func.isRequired,
    speedFactor: PropTypes.func.isRequired,
    factor: PropTypes.array,
  }

  static defaultProps = {
    factor: [1, 2, 4, 8, 10, 15, 20],
  }

  onToggleClick = () => {
    const value = !this.props.togglePlay
    this.props.onPlayPause(value)
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleListClick = (item) => (event) => {
    this.setState({ anchorEl: null })
    this.props.speedFactor(item)
  }

  handleClose = (event) => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { classes, togglePlay, speed, factor } = this.props

    return (
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.rightPadding}
      >
        <Grid item xs={6}>
          {togglePlay ? (
            <Tooltip title="Pause">
              <Fab
                color="primary"
                aria-label="play"
                className={classNames(classes.fab, classes.catchAllEvents)}
                onClick={this.onToggleClick}
              >
                <PauseArrowIcon />
              </Fab>
            </Tooltip>
          ) : (
            <Tooltip title="Play">
              <Fab
                color="primary"
                aria-label="pause"
                className={classNames(classes.fab, classes.catchAllEvents)}
                onClick={this.onToggleClick}
              >
                <PlayArrowIcon />
              </Fab>
            </Tooltip>
          )}
        </Grid>

        <Grid item xs={6}>
          <Tooltip title="Playback Speed">
            <ColorButton
              aria-owns={this.state.anchorEl ? 'speed-menu' : null}
              aria-haspopup="true"
              onClick={this.handleClick}
              color="default"
              variant="contained"
              className={classes.catchAllEvents}
            >
              {`${speed}x`}
            </ColorButton>
          </Tooltip>
          <Menu
            id="speed-menu"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            {factor.map((item) => (
              <MenuItem
                key={item}
                onClick={this.handleListClick(item)}
              >{`${item}x`}</MenuItem>
            ))}
          </Menu>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(ReplayControlPanel)
