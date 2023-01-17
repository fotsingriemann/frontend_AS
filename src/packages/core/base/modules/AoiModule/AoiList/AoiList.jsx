import React, { Component, Fragment } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
  IconButton,
  Typography,
  Input,
  InputAdornment,
  withStyles,
} from '@material-ui/core'

const styles = (theme) => ({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableTableRow: {
    cursor: 'pointer',
  },
})

const ROWS_PER_PAGE = 5

class AoiList extends Component {
  state = {
    currentPage: 0,
    searchValue: '',
    confirmDelete: false,
    enableDelete: false,
    deleteConfirmed: false,
    toBeDeleted: null,
    order: 'desc',
  }

  handleRequestSort = (event) => {
    let order = 'desc'

    if (this.state.order === 'desc') {
      order = 'asc'
    }
    this.setState({ order }, () => {
      this.props.onRequestAreaSort(this.state.order)
    })
  }

  handlePageChange = (pageNumber) => this.setState({ currentPage: pageNumber })

  onSelectedAoi = (aoi) => this.props.onSelectedAoiChange(aoi)

  handleSearchValueChange = (e) =>
    this.setState({ searchValue: e.target.value })

  render() {
    const { classes, aois, selectedLanguage } = this.props
    const { currentPage, searchValue } = this.state
    const count = aois.length
    const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)

    const filteredAois = aois
      .filter((aoi) =>
        aoi.areaName.toLowerCase().includes(searchValue.toLowerCase())
      )
      .slice(
        currentPage * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      )

    return (
      <Fragment>
        <Input
          fullWidth
          placeholder={languageJson[selectedLanguage].aoiPage.searchAoi}
          onChange={this.handleSearchValueChange}
          startAdornment={
            <InputAdornment>
              <SearchIcon />
            </InputAdornment>
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].aoiPage.aoiDetails
                    .areaNameLabel
                }
              </TableCell>
              <TableCell size="small" sortDirection={this.state.order}>
                <TableSortLabel
                  active={true}
                  direction={this.state.order}
                  onClick={this.handleRequestSort}
                >
                  {
                    languageJson[selectedLanguage].aoiPage.aoiDetails
                      .createdOnLabel
                  }
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAois.map((aoi) => (
              <TableRow
                hover
                className={classes.clickableTableRow}
                key={aoi.id}
                onClick={() => {
                  if (!this.state.enableDelete) this.onSelectedAoi(aoi)
                }}
              >
                <TableCell size="small">{aoi.areaName}</TableCell>
                <TableCell size="small">
                  {getFormattedTime(aoi.createdAt, 'lll')}
                </TableCell>
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

export default withLanguage(withStyles(styles)(AoiList))
