/**
 * @module SimpleTable
 * @summary This module exports the SimpleTable component
 */
import React, { Component, Fragment } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'

import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  Input,
  InputAdornment,
  withStyles,
  IconButton
} from '@material-ui/core'

const styles = theme => ({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clickableTableRow: {
    cursor: 'pointer'
  },
  button: {
    margin: theme.spacing(1)
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4)
  },
  buttonContainer: {
    marginTop: 15
  }
})

/**
 * @summary SimpleTable component renders a table for use with trips module
 */
class SimpleTable extends Component {
  /**
   * @property {number} currentPage The current page of the paginated table
   * @property {string} searchValue The value of the search field
   */
  state = {
    currentPage: 0,
    searchValue: ''
  }

  /**
   * @function
   * @param {object} prevProps The previous props of the component before update
   * @summary Lifecycle method called after the component updates
   */
  componentDidUpdate = prevProps => {
    if (this.props.selectedTripType !== prevProps.selectedTripType) {
      this.setState({ currentPage: 0 })
    }
  }

  /**
   * @callback
   * @param {number} pageNumber The changed page number
   * @summary Callback called to change page number
   */
  handlePageChange = pageNumber => {
    this.setState({ currentPage: pageNumber })
  }

  /**
   * @callback
   * @param {object} e The input change event
   * @summary Callback called on change of search field input
   */
  handleSearchValueChange = e => this.setState({ searchValue: e.target.value })

  render() {
    const {
      classes,
      data,
      ROWS_PER_PAGE,
      placeholder,
      headers,
      keys,
      searchLabel,
      padding
    } = this.props

    const { currentPage, searchValue } = this.state

    const count = data.length
    const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)
    let filteredData = []

    if (searchLabel) {
      filteredData = data
        .filter(item =>
          item[`${searchLabel}`]
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        )
        .slice(
          currentPage * ROWS_PER_PAGE,
          currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
        )
    } else {
      filteredData = data.slice(
        currentPage * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      )
    }

    return (
      <Fragment>
        {searchLabel && (
          <Input
            placeholder={placeholder || 'Searching'}
            onChange={this.handleSearchValueChange}
            startAdornment={
              <InputAdornment>
                <SearchIcon />
              </InputAdornment>
            }
          />
        )}
        <Table padding="default">
          <TableHead>
            <TableRow>
              {headers &&
                headers.map((title, index) => (
                  <TableCell key={index} size={padding || 'small'}>
                    {title}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow hover className={classes.clickableTableRow} key={index}>
                {keys &&
                  keys.map((name, index) => (
                    <TableCell key={index} size="small">
                      {item[`${name}`]}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={classes.customFooter}>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage - 1)
            }}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="caption">{`${from} - ${to} of ${count}`}</Typography>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage + 1)
            }}
            disabled={currentPage >= Math.ceil(count / ROWS_PER_PAGE) - 1}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </Fragment>
    )
  }
}

export default withStyles(styles)(SimpleTable)
