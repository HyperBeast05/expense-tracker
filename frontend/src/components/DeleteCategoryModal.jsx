import { Button, Modal, Spinner } from "react-bootstrap";

const DeleteCategoryModal = ({
  show,
  category,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={deleting ? "static" : true}
      keyboard={!deleting}
    >
      <Modal.Header closeButton={!deleting}>
        <Modal.Title>Delete Category</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Are you sure you want to delete <strong>{category?.name}</strong>?
        <p className="text-muted small mt-2 mb-0">
          Categories linked to existing transactions may not be deleteable.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={deleting || !category}
        >
          {deleting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Deleting...
            </>
          ) : (
            "Delete Category"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCategoryModal;
