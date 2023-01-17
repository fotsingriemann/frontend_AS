/**
 * @module Report/DefaultReportsList
 * @summary This module exports the component to display list of default reports
 */

import React, { Fragment } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Divider,
  Paper,
  Button,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { REPORT_ICONS } from '@zeliot/common/constants/others'

const useStyles = makeStyles((theme) => ({
  reportCard: {
    cursor: 'pointer',

    '&:hover': {
      boxShadow: '0px 1px 5px 1px rgba(0, 0, 0, 0.5)',
    },
  },

  iconContainer: {
    margin: theme.spacing(3, 0),
  },

  reportIcon: {
    display: 'block',
    margin: '0 auto',
  },

  reportCardsContainer: {
    padding: 0,
    margin: theme.spacing(1),
  },
}))

function DefaultReportsList({
  defaultReports,
  status,
  retry,
  onReportClick,
  headerTitle,
}) {
  const history = useHistory()
  const classes = useStyles()

  return (
    <Fragment>
      <Grid item xs={12}>
        <Typography variant="body2">{headerTitle}</Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      {status === 'LOADED' ? (
        <Grid
          item
          xs={12}
          container
          spacing={2}
          className={classes.reportCardsContainer}
        >
          {defaultReports.map((defaultReport) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={defaultReport.reportName}
            >
              <Paper
                onClick={() => {
                  onReportClick(defaultReport)
                  history.push('/home/report/viewer')
                }}
                className={classes.reportCard}
              >
                <Grid container>
                  <Grid item xs={12} className={classes.iconContainer}>
                    {REPORT_ICONS[defaultReport.reportName] ? (
                      <img
                        src={REPORT_ICONS[defaultReport.reportName]}
                        width="auto"
                        height="50px"
                        className={classes.reportIcon}
                      />
                    ) : (
                      <img
                        src={REPORT_ICONS['Current Summary Report']}
                        width="auto"
                        height="50px"
                        className={classes.reportIcon}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" align="center">
                      {defaultReport.reportName}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : status === 'LOADING' ? (
        <div>Loading</div>
      ) : (
        status === 'ERROR' && (
          <Grid container>
            <Grid item xs={12}>
              Error fetching default reports list
            </Grid>
            <Grid item xs={12}>
              <Button size="small" variant="outlined" onClick={retry}>
                Retry
              </Button>
            </Grid>
          </Grid>
        )
      )}
    </Fragment>
  )
}

export default DefaultReportsList
