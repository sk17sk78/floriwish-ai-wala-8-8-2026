interface FormFields extends HTMLFormControlsCollection {
  userName: HTMLInputElement;
  password: HTMLInputElement;
  isSuperAdmin: HTMLInputElement;
  role: HTMLSelectElement;
}

const getDocumentsFromFormFieldsGenerator = () => (elements: FormFields) => {
  const isSuperAdmin = elements.isSuperAdmin.checked;

  return {
    userName: elements.userName.value,
    ...(elements.password.value ? { password: elements.password.value } : {}),
    isSuperAdmin,
    ...(isSuperAdmin
      ? { $unset: { role: "" } }
      : { role: elements.role ? elements.role.value : "" }),
    createdBy: "",
    updatedBy: ""
  };
};

export default getDocumentsFromFormFieldsGenerator;
