import React from "react";
import Modal from 'react-modal';
import Tooltip from "@material-ui/core/Tooltip";
import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import '../modal.css'
import './styles.css'
const Items = (props) => {
  // const customStyles = {
  //   content: {
  //     top: '50%',
  //     left: '50%',
  //     right: 'auto',
  //     bottom: 'auto',
  //     marginRight: '-50%',
  //     transform: 'translate(-50%, -50%)',
  //     overflowY: "auto",
  //     opacity: "5",
  //     width: '60%',
  //     height: '450px',
  //     borderRadius: '10px',
  //     boxShadow: '2xl',
  //   },
  //   // overlay: {
  //   //   backgroundColor: 'black',
  //   //   color: 'black'
  //   // }
  // };

  // const [modalIsOpen, setIsOpen] = React.useState(false);
  const [voitures, setVoitures] = React.useState(null);

  function setting(vehicle) {
    setVoitures(vehicle)
  }

  // function openModal() {
  //   setIsOpen(true);
  // }

  // function closeModal() {
  //   setIsOpen(false);
  // }

  useEffect(() => {
    setting(props.vehicle)
  }, [props.vehicle]);

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
      {/* <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {voitures ? Object.values(voitures).map((voiture, index) => (
          <>
            <h1>{voiture.vehicleNumber}</h1>
          </>
        )) : (<h2>No found</h2>)}

        <Button className="bg-green-600" onClick={closeModal}>close</Button>
      </Modal> */}

      {voitures && console.log(Object.values(voitures))}

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <table >
              <tr>
                <th>Numero d'immatriculation</th>
                <th>Speed</th>
                <th>Address</th>
                <th>Model</th>
                <th>Address</th>

              </tr>
              {voitures ? Object.values(voitures).map((voiture, index) => (
                <>
                  <tr>
                    <td>{voiture.vehicleNumber}</td>
                    <td>{voiture.speed}</td>
                    <td>{voiture.address}</td>
                    <td>{voiture.vehicleModel}</td>
                    <td>{voiture.vehicleType}</td>


                  </tr>
                </>
              )) : (<h2>No found</h2>)}

              {/* <button className="close-modal" onClick={toggleModal}>
                  CLOSE
                </button> */}
            </table>
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