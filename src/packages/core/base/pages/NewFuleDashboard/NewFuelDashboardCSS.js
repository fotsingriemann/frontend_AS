import {
  makeStyles
}

from '@material-ui/core/styles'

export const useStyles=makeStyles((theme)=> ( {
      root: {
        flexGrow: 1,
        marginLeft: '-0.2rem',
      }

      ,
      containerStyle: {
        marginTop: '4vh',
        marginLeft: '2rem',
      }

      ,
      reportStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
      }

      ,
    }

	)) 

export const reportStyle= {
  height: '80vh',
    width: '99',
}
