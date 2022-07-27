import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { firestore } from '../../firebase/firebase';
import { doc, deleteDoc, collection } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { refresh } from '../../redux/refreshPageSlice';

export const Modal = ({title, text}) => {
  const [modalText, setModalText] = useState(text);
  const [loading, setLoading] = useState(''); 
  const { id } = useSelector(state => state.collection);
  const { userEmail } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleDeleting = () => {
    setLoading('Deleting');
    const db = collection(firestore, 'flashcardCollection');
    const storage = getStorage();
    const imgRef = ref(storage, `flashcardCollectionImage/${userEmail}/${id}`);
    deleteDoc(doc(db, id))//Deletar um flashcardCollection
      .then(() => {
        deleteObject(imgRef)//Deletar a imagem vinculada a coleção
          .then(() => {
            setLoading('Deleted');
            setModalText('Coleção deletada com sucesso.');
          })
          .catch((error) => {//Se a imagem não for encontrada
            setLoading('Deleted');
            setModalText(`A coleção foi deletada com sucesso, mas apresentou o seguinte erro ao deletar a imagem: ${error.code}`);
          })
          .finally(() => {
            dispatch(refresh());//Dispara ação para alterar valor do RefreshPage
          })
      })
      .catch((error) => {
        setLoading('Deleted');
        setModalText(error.code);
      });
  }

  return(
    <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{background: '#2D294C'}}>
          <div className="modal-header" style={{background: '#413D5D', borderColor: '#615b86'}}>
            <h5 className="modal-title" id="staticBackdropLabel">{title}</h5>
          </div>
          <div className="modal-body">
            <span>{modalText}</span>
          </div>
          <div className="modal-footer" style={{borderColor: '#615b86'}}>
            {
              loading === '' ?
              <>
                <button type="button" className="btn btn-primary" onClick={() => handleDeleting()}>Sim</button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              </>
              :
              loading === 'Deleting' ?
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              :
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {
                setLoading(''),
                setModalText(text)
              }}>Fechar</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}