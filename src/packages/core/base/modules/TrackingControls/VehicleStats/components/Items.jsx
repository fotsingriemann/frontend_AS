import React from "react";
import Modal from 'react-modal';
import Tooltip from "@material-ui/core/Tooltip";
import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loadingSpinner";
import '../modal.css'
import './styles.css'
const Items = (props) => {
  const [voitures, setVoitures] = React.useState(null);
  const [allAreas, setAllAreas] = React.useState(null);
  const [posArea, setPosArea] = React.useState(null);
  /////////////////


  ///////////////


  useEffect(() => {
    setAllAreas(allAreas)
    setVoitures(voitures)
  }, [voitures, allAreas]);


  const [isLoading, setIsLoading] = useState(false);
  function setting(vehicle) {
    setVoitures(vehicle)
  }

  console.log(voitures)

  function settingAOI(allAreas) {
    setAllAreas(allAreas)
  }

  useEffect(() => {
    setting(props.vehicle)
    settingAOI(props.allAOI)
  }, [props.vehicle, props.allAOI]);

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  if (modal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }


  return (
    <>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div>


            <div className="modal-content">
              <center><h1><span style={{ fontWeight: "bold", color: "red", fontSize: "20px" }}>{props.title}</span></h1></center>
              <center><h1><span style={{ color: "black", fontSize: "9px" }}>{props.lang}</span></h1></center>
              <hr></hr>
              <table id="example" className="display dataTable" style={{ width: "100%" }}>

                {

                  props.viols ?

                    <>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>VehicleNumber</th>
                          <th>Location</th>
                          <th>Alert type</th>
                          <th>Latitude</th>
                          <th>Longitude</th>
                        </tr>
                      </thead>
                      <tbody>
                        {

                          voitures ? Object.values(voitures).map((voiture, index) => (
                            // voiture.timestamp >= 1674081713 ?
                            <tr>
                              <td>{index + 1}</td>
                              <td>{voiture.to_ts}</td>
                              <td>{voiture.vehicleNumber}</td>
                              <td>{voiture.address}</td>
                              <td>{voiture.alerttype}</td>
                              <td>{voiture.lat}</td>
                              <td>{voiture.lng}</td>
                            </tr>
                            // : <tr></tr>

                          )) : (<LoadingSpinner />)
                        }
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>VehicleNumber</th>
                          <th>Location</th>
                          <th>Alert type</th>
                          <th>Latitude</th>
                          <th>Longitude</th>
                        </tr>
                      </tfoot>
                    </>


                    :

                    props.trip ?

                      <>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>cursor</th>
                            <th>tripName</th>
                            <th>places</th>
                            <th>AreaName</th>
                            <th>Status</th>
                            <th>fromTimestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {

                            voitures ? Object.values(voitures).map((voiture, index) => (
                              // voiture.timestamp >= 1674081713 ?
                              <tr>
                                <td>{index + 1}</td>
                                <td>{voiture.cursor}</td>
                                <td>{voiture.node.tripName}</td>
                                <td>{voiture.node.route.places}</td>
                                <td>{voiture.node.route.areaName}</td>
                                <td>{voiture.node.status}</td>
                                <td>{voiture.node.fromTimestamp}</td>
                              </tr>
                              // : <tr></tr>

                            )) : (<LoadingSpinner />)
                          }
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>ID</th>
                            <th>cursor</th>
                            <th>tripName</th>
                            <th>places</th>
                            <th>AreaName</th>
                            <th>Status</th>
                            <th>fromTimestamp</th>
                          </tr>
                        </tfoot>
                      </>

                      :
                      <>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>vehicleNumber</th>
                            <th>speed</th>
                            <th>vehicleModel</th>
                            <th>vehicleType</th>
                            <th>Timestamp</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            props.decide ?
                              voitures ? Object.values(voitures).map((voiture, index) => (
                                // voiture.timestamp >= 1674081713 ?
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{voiture.vehicleNumber}</td>
                                  <td>{voiture.speed}</td>
                                  <td>{voiture.vehicleModel}</td>
                                  <td>{voiture.vehicleType}</td>
                                  <td>{voiture.timestamp}</td>
                                  <td>{voiture.latitude}</td>
                                  <td>{voiture.longitude}</td>
                                </tr>
                                // : <tr></tr>

                              )) : (<LoadingSpinner />)
                              :
                              voitures ? Object.values(voitures).map((voiture, index) => (
                                voiture.timestamp >= 1674081713 && voiture[props.take] ?
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{voiture.vehicleNumber}</td>
                                    <td>{voiture.speed}</td>
                                    <td>{voiture.vehicleModel}</td>
                                    <td>{voiture.vehicleType}</td>
                                    <td>{voiture.timestamp}</td>
                                    <td>{voiture.latitude}</td>
                                    <td>{voiture.longitude}</td>
                                  </tr>
                                  : <tr></tr>

                              )) : (<LoadingSpinner />)
                          }
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>ID</th>
                            <th>vehicleNumber</th>
                            <th>speed</th>
                            <th>vehicleModel</th>
                            <th>vehicleType</th>
                            <th>Timestamp</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                          </tr>
                        </tfoot>
                      </>}
              </table>
            </div>
          </div>
        </div>
      )}




      <div className=" w-full md:w-1/2 xl:w-1/4 p-8" onClick={() => { props.fonct(props.filter); toggleModal() }} style={{ cursor: "pointer" }}>
        <Tooltip title={props.lang} placement="center" color="bleu">
          <div className={"hover:shadow-2xl bg-gradient-to-b from-green-200 to-green-100 border-b-4 " + "border-" + props.style + " rounded-lg shadow-xl p-5"}>
            <div className="flex flex-row items-center">
              <div className="flex-shrink pr-4">
                <div className={"rounded-full p-5 " + "bg-" + props.style}><props.icon size={25} /></div>
              </div>
              <div className="flex-1 text-right md:text-center">
                <h5 className="font-bold uppercase text-gray-600">{props.title}</h5>
                <h3 className="font-bold text-3xl">{props.top}<span className="text-green-500"><i className="fas fa-caret-up"></i></span></h3>
              </div>
            </div>
          </div>

        </Tooltip>

      </div>
    </>
  )
}

export default Items