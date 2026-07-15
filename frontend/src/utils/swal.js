import Swal from "sweetalert2";

export const swalSuccess = (title, text = "") => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#16a34a",
  });
};

export const swalError = (title, text = "") => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626",
  });
};

export const swalWarning = (title, text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#f59e0b",
  });
};

export const swalConfirm = ({
  title,
  text,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) => {
  return Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
  });
};

export const swalLoading = (title = "Procesando...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const swalClose = () => {
  Swal.close();
};
