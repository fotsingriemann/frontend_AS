/**
 * @module Report/CustomReportsList
 * @summary This module exports the component to display list of custom reports
 */

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Divider,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import { Add as AddIcon } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.link.main,
    '&:visited': {
      color: theme.palette.link.main,
    },
  },
}))

const CustomReportsList = ({
  customReports,
  status,
  retry,
  onReportClick,
  onAdd,
  onEdit,
  onDelete,
  headerTitle,
  newCustomReportButtonTitle,
}) => {
  const classes = useStyles()

  if (status === 'LOADED') {
    return (
      <div>
        <Grid style={{ marginBottom: 16 }} container justify="space-between">
          <Grid item>
            <Typography variant="body2">{headerTitle}</Typography>
          </Grid>
          <Grid item>
            <ColorButton
              size="small"
              variant="contained"
              color="primary"
              onClick={onAdd}
            >
              <AddIcon /> {newCustomReportButtonTitle}
            </ColorButton>
          </Grid>
        </Grid>

        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>NAME</TableCell>
              {/* <TableCell>DESCRIPTION</TableCell> */}
              <TableCell>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customReports &&
              customReports.map((customReport) => (
                <TableRow key={customReport.reportName}>
                  {/* eslint-disable jsx-a11y/anchor-is-valid */}

                  <TableCell scope="row">
                    <Link
                      className={classes.link}
                      to="/home/report/viewer"
                      key={customReport.reportName}
                      onClick={() => onReportClick(customReport)}
                    >
                      {customReport.reportName}
                    </Link>
                  </TableCell>
                  {/* <TableCell>This is a short report description.</TableCell> */}
                  <TableCell>
                    <a
                      className={classes.link}
                      href=""
                      onClick={(e) => {
                        e.preventDefault()
                        onEdit(customReport)()
                      }}
                    >
                      Edit
                    </a>{' '}
                    |{' '}
                    <a
                      className={classes.link}
                      href=""
                      onClick={(e) => {
                        e.preventDefault()
                        onDelete(customReport)
                      }}
                    >
                      Delete
                    </a>
                  </TableCell>
                  {/* eslint-enable jsx-a11y/anchor-is-valid */}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    )
  } else if (status === 'LOADING') {
    return <div>Loading Custom Reports</div>
  } else {
    return (
      <Grid container>
        <Grid item xs={12}>
          Error fetching custom reports list
        </Grid>
        <Grid item xs={12}>
          <Button size="small" variant="outlined" onClick={retry}>
            Retry
          </Button>
        </Grid>
      </Grid>
    )
  }
}

export default CustomReportsList
