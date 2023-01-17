/**
 * @module Report/CustomReportDialog
 * @summary This module exports a Dialog for editing/creating custom reports
 */

import React, { Fragment } from 'react'
import { getFieldNameFromFieldId } from '../utils'
import styles from './styles'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
  Button,
  withStyles,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

/**
 * Confirmation Dialog for deleting custom reports
 * @param {object} props React component props
 */
function DeleteCustomReportConfirmationDialog(props) {
  const { onDeletion, onCancel, customReportName } = props

  return (
    <Fragment>
      <DialogTitle>{`Delete ${customReportName}?`}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <ColorButton onClick={onDeletion} color="primary" variant="contained">
          Delete
        </ColorButton>
      </DialogActions>
    </Fragment>
  )
}

/**
 * Dialog for editing custom reports
 * @param {object} props React component props
 */
function CustomReportEditorDialog(props) {
  const {
    classes,
    reportDialogMode,
    handleCustomReportDialogClose,
    baseReport,
    handleChange,
    baseAlert,
    alerts,
    fields,
    allCustomFields,
    selectedCustomFields,
    handleSelectedCustomFieldsChange,
    customReportName,
    handleCustomReportDialogSubmit,
  } = props

  return (
    <Fragment>
      <DialogTitle id="custom-report-dialog-title">
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            {reportDialogMode === 'CREATE'
              ? 'Create a Custom Report'
              : `Edit ${customReportName}`}
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <form className={classes.customReportBuilderDialogContainer}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                id="custom-report-name"
                name="customReportName"
                label="Custom Report Name"
                value={customReportName}
                onChange={handleChange}
                margin="normal"
                inputProps={{
                  maxLength: 35,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl className={classes.selector}>
                <InputLabel htmlFor="base-report-selector">
                  Select report type
                </InputLabel>

                <Select
                  value={baseReport}
                  onChange={handleChange}
                  inputProps={{
                    name: 'baseReport',
                    id: 'base-report-selector',
                  }}
                  MenuProps={{
                    classes: {
                      paper: classes.selectMenuPaper,
                    },
                  }}
                >
                  <MenuItem value="ALERT_REPORT">Alert Report</MenuItem>
                  <MenuItem value="CONSOLIDATED_REPORT">
                    Consolidated Report
                  </MenuItem>
                  ) )}
                </Select>
              </FormControl>
            </Grid>

            {baseReport === 'ALERT_REPORT' && (
              <Grid item xs={12} md={6}>
                <FormControl className={classes.selector}>
                  <InputLabel htmlFor="base-alert-selector">
                    Select alert type
                  </InputLabel>

                  <Select
                    value={baseAlert}
                    onChange={handleChange}
                    inputProps={{
                      name: 'baseAlert',
                      id: 'base-alert-selector',
                    }}
                    MenuProps={{
                      classes: {
                        paper: classes.selectMenuPaper,
                      },
                    }}
                  >
                    {alerts.map((report) => {
                      const alertName = report.reportType.replace(' Report', '')
                      const reportType = report.reportTypeId

                      return (
                        <MenuItem key={alertName} value={reportType}>
                          {alertName}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Grid container>
                {allCustomFields.map((field) => (
                  <Grid
                    key={field}
                    item
                    xs={12}
                    sm={6}
                    md={baseReport === 'DIGITALINPUT_REPORT' ? 6 : 4}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={selectedCustomFields.includes(field)}
                          onChange={handleSelectedCustomFieldsChange(field)}
                          value={field}
                        />
                      }
                      label={getFieldNameFromFieldId(fields, field)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCustomReportDialogClose} color="primary">
          Cancel
        </Button>

        <Button
          onClick={handleCustomReportDialogSubmit}
          color="primary"
          disabled={
            !(
              customReportName &&
              selectedCustomFields.length &&
              baseReport &&
              (baseReport === 'CONSOLIDATED_REPORT' || baseAlert)
            )
          }
        >
          Submit
        </Button>
      </DialogActions>
    </Fragment>
  )
}

/**
 * Wrapper component to conditionally render custom report editor dialog or
 * deletion confirmation dialog
 * @param {object} props React component props
 */
function CustomReportDialog(props) {
  const [
    showDeleteConfirmationDialog,
    setShowDeleteConfirmationDialog,
  ] = React.useState(false)

  const {
    isCustomReportDialogOpen,
    handleCustomReportDialogClose,
    classes,
    reportDialogMode,
    baseReport,
    handleChange,
    baseAlert,
    alerts,
    fields,
    allCustomFields,
    selectedCustomFields,
    handleSelectedCustomFieldsChange,
    customReportName,
    handleCustomReportDialogSubmit,
    handleDeletion,
  } = props

  // console.log('base report', baseReport)
  // console.log('base alert', baseAlert)

  return (
    <Dialog
      open={isCustomReportDialogOpen}
      onClose={handleCustomReportDialogClose}
      aria-labelledby="custom-report-creator"
    >
      {showDeleteConfirmationDialog ? (
        <DeleteCustomReportConfirmationDialog
          customReportName={customReportName}
          onDeletion={handleDeletion}
          onCancel={() => setShowDeleteConfirmationDialog(false)}
        />
      ) : (
        <CustomReportEditorDialog
          isCustomReportDialogOpen={isCustomReportDialogOpen}
          handleCustomReportDialogClose={handleCustomReportDialogClose}
          classes={classes}
          reportDialogMode={reportDialogMode}
          baseReport={baseReport}
          handleChange={handleChange}
          baseAlert={baseAlert}
          alerts={alerts}
          fields={fields}
          allCustomFields={allCustomFields}
          selectedCustomFields={selectedCustomFields}
          handleSelectedCustomFieldsChange={handleSelectedCustomFieldsChange}
          customReportName={customReportName}
          handleCustomReportDialogSubmit={handleCustomReportDialogSubmit}
          onDelete={() => setShowDeleteConfirmationDialog(true)}
        />
      )}
    </Dialog>
  )
}

export default withStyles(styles)(CustomReportDialog)
