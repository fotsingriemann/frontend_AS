import React from 'react'
import { Grid, Checkbox, makeStyles, Chip } from '@material-ui/core'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import getFromNow from '@zeliot/common/utils/time/getFromNow'
import Loader from '@zeliot/common/ui/Loader/Loader'

const useVehicleListItemStyles = makeStyles({
  listItem: {
    borderBottom: '1px solid rgba(230, 230, 230, 0.6)',
    borderTop: '1px solid rgba(230, 230, 230, 0.6)',
    cursor: 'pointer',
  },
  listItemData: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItemDataContainer: {
    flex: 1,
  },
  smallFont: {
    fontSize: 10,
  },
})

function VehicleListItem({
  vehicle,
  onSelectionChange,
  onSelectedVehicleChange,
}) {
  const classes = useVehicleListItemStyles()

  return (
    <Grid
      item
      container
      xs={12}
      className={classes.listItem}
      onClick={() => {
        if (vehicle.timestamp !== null) {
          onSelectedVehicleChange(vehicle)
        }
      }}
    >
      <Grid item>
        <Checkbox
          color="primary"
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelectionChange(vehicle.uniqueId)}
          checked={vehicle.isSelected}
        />
      </Grid>

      <Grid
        item
        container
        alignItems="center"
        className={classes.listItemDataContainer}
      >
        <Grid item xs={12} className={classes.listItemData}>
          <Grid container item alignItems="center" style={{ flex: 1 }}>
            <Grid item xs={6}>
              <div
                className={classes.smallFont}
                style={{
                  fontWeight: 'bold',
                  fontSize: 11,
                  display: 'inline-block',
                  //padding: '0 25',
                  // height: '100',
                  // padding: '100',
                  //background: '#f1f1f1',
                  borderRadius: 5,
                }}
              >
                <div>{vehicle.vehicleNumber}</div>
              </div>
            </Grid>

            <Grid item xs={6}>
              <div className={classes.smallFont}>
                {vehicle.timestamp ? getFromNow(vehicle.timestamp) : 'No Data'}
              </div>
            </Grid>
          </Grid>
          <Grid container item alignItems="center" style={{ flex: 1 }}>
            <Grid item xs={12}>
              {vehicle.vehicleGroups && (
                <div className={classes.smallFont}>
                  {vehicle.vehicleGroups.join(', ')}
                  {/* <Chip label={vehicle.vehicleGroups} /> */}
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

function sortVehicles(vehicleA, vehicleB) {
  return Number(vehicleB.isSelected) - Number(vehicleA.isSelected)
}

function VehicleList({
  languageJson,
  selectedLanguage,
  vehicles: vehiclesList,
  onSelectionChange,
  searchValue,
  selectedVehicleIds,
  onSelectionAllChange,
  onSelectedVehicleChange,
}) {
  let vt = Object.values(vehiclesList)

  vt.sort((a, b) => b.timestamp - a.timestamp)
  let vehicles = vt

  vehicles = vehicles.filter((vehicle) =>
    vehicle.vehicleNumber.toLowerCase().includes(searchValue.toLowerCase())
  )

  // vehicles.sort(sortVehicles)

  return (
    <Grid container>
      <Grid item container xs={12}>
        <Grid item>
          <Checkbox
            color="primary"
            indeterminate={
              selectedVehicleIds.length > 0 &&
              selectedVehicleIds.length < vehicles.length
            }
            checked={selectedVehicleIds.length > 0}
            onChange={onSelectionAllChange}
          />
        </Grid>

        <Grid container item alignItems="center" style={{ flex: 1 }}>
          <Grid item xs={6}>
            {languageJson[selectedLanguage].common.vehicleNumber}
          </Grid>

          <Grid item xs={6}>
            {languageJson[selectedLanguage].common.lastTracked}
          </Grid>
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        container
        style={{
          maxHeight: 550,
          overflowY: 'auto',
        }}
        className="scrollbar"
        alignItems="flex-start"
        alignContent="flex-start"
      >
        {vehicles ? (
          vehicles.map((vehicle) => (
            <VehicleListItem
              key={vehicle.uniqueId}
              onSelectedVehicleChange={onSelectedVehicleChange}
              vehicle={vehicle}
              onSelectionChange={onSelectionChange}
            />
          ))
        ) : (
          <Loader spinnerSize={40} />
        )}
      </Grid>
    </Grid>
  )
}

export default VehicleList
