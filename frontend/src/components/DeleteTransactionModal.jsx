import { Button, Modal, Spinner } from "react-bootstrap";
import { FaRegTrashCan } from "react-icons/fa6";

const DeleteTransactionModal = ({
  show,
  transaction,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      show={show}
      onHide={deleting ? undefined : onClose}
      centered
      backdrop={deleting ? "static" : true}
      keyboard={!deleting}
    >
      <Modal.Header closeButton={!deleting}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaRegTrashCan className="text-danger" />
          Delete Transaction
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-2">
          Are you sure you want to delete this transaction?
        </p>

        <div className="bg-light border rounded p-3">
          <div className="fw-semibold">
            {transaction.description || transaction.categoryName}
          </div>

          <div className="small text-muted mt-1">
            Category: {transaction.categoryName}
          </div>

          <div className="fw-semibold mt-2">
            Amount: ₹
            {Number(transaction.amount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <p className="text-danger small mt-3 mb-0">
          This action cannot be undone.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>

        <Button variant="danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Deleting...
            </>
          ) : (
            <>
              <FaRegTrashCan className="me-2" />
              Delete Transaction
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTransactionModal;
