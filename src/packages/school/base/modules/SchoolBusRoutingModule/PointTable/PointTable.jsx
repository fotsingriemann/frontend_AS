import React, { Component, Fragment } from 'react'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import DoneIcon from '@material-ui/icons/Done'

import {
  withStyles,
  TableCell,
  TableRow,
  Tooltip,
  IconButton,
  Input
} from '@material-ui/core'

const styles = theme => ({
  customCell: {
    padding: '4px 15px 4px 10px',
    textAlign: 'center',
    height: 55
  }
})

class PointTableRow extends Component {
  state = {
    rowHovered: false,
    editMode: false,
    name: ''
  }

  handleEdit = index => event => {
    this.setState(
      {
        editMode: true
      },
      () => {
        this.props.aoiNameValidationChange(index, !this.state.editMode)
      }
    )
  }

  handleValueChange = event => {
    this.setState({ name: event.target.value })
  }

  render() {
    const { value, index, pointsSaved } = this.props

    return (
      <TableRow
        hover
        tabIndex={-1}
        key={index}
        onMouseEnter={() => {
          if (!pointsSaved) {
            this.setState({ rowHovered: true })
          }
        }}
        onMouseLeave={() => {
          if (!pointsSaved) {
            this.setState({ rowHovered: false })
          }
        }}
      >
        <TableCell classes={{ root: this.props.classes.customCell }}>
          {index + 1}
        </TableCell>
        <TableCell classes={{ root: this.props.classes.customCell }}>
          {this.state.editMode ? (
            <Input
              style={{ width: '50px' }}
              value={this.state.name}
              onChange={this.handleValueChange}
            />
          ) : (
            value.name
          )}
        </TableCell>
        <TableCell classes={{ root: this.props.classes.customCell }}>
          {value.students.length}
        </TableCell>
        <TableCell padding="none">
          {this.state.rowHovered ? (
            <Fragment>
              {this.state.editMode ? (
                <IconButton
                  color="primary"
                  onClick={() => {
                    if (!(this.state.name === '')) {
                      this.setState({ editMode: false }, () => {
                        this.props.aoiNameValidationChange(
                          index,
                          !this.state.editMode
                        )
                      })
                    }
                    this.props.handleEdit(value, this.state.name)
                  }}
                >
                  <DoneIcon />
                </IconButton>
              ) : (
                <Tooltip title="Edit names">
                  <IconButton onClick={this.handleEdit(index)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => {
                    this.props.handleDelete(value, index)
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Fragment>
          ) : (
            <div
              style={{
                padding: '0 48px'
              }}
            />
          )}
        </TableCell>
      </TableRow>
    )
  }
}

export default withStyles(styles)(PointTableRow)
