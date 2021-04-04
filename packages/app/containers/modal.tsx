
interface ModalProps {
  children: JSX.Element[];
  visible: String;

}
export default function Modal({ visible, children }: ModalProps) {

  return (
    <div className={ visible + " modal-main-div"}>
      <div className="modal-content-div">
        {children}
      </div>
    </div>
  )
}