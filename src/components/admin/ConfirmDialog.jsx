import Alert from '../common/Alert'
import Button from '../common/Button'
import Modal from '../common/Modal'

// "Are you sure?" box. The parent passes an error message if the action failed.
export default function ConfirmDialog({ title, children, confirmLabel = 'Confirm', onConfirm, onCancel, isWorking, error }) {
  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} isLoading={isWorking}>{confirmLabel}</Button>
    </>
  )

  return (
    <Modal title={title} onClose={onCancel} footer={footer} size="sm">
      <div className="confirm-dialog__body">{children}</div>
      {error && <Alert tone="error" title={error} className="confirm-dialog__error" />}
    </Modal>
  )
}
