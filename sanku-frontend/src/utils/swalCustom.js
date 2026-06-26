import Swal from 'sweetalert2';

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

export const swalConfig = {
  confirmButtonColor: '#0ea5e9',
  cancelButtonColor: '#94a3b8',
  buttonsStyling: true,
  customClass: {
    popup: 'rounded-3xl shadow-2xl',
    confirmButton: 'px-6 py-2.5 rounded-xl font-bold',
    cancelButton: 'px-6 py-2.5 rounded-xl font-bold'
  }
};