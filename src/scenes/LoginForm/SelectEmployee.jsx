import React from "react";
import { useNavigate } from "react-router-dom";


const SelectEmployee = () => {
  const selectedLocation = JSON.parse(
    localStorage.getItem("selected_location")
  );
  const navigate = useNavigate();

  const handleEmployeeSelect = async (employee) => {
    localStorage.setItem("selected_employee", JSON.stringify(employee));

    
   
    navigate("/enter-passcode");
  };

  return (
    <div>
      <h2>Choose Employee</h2>
      {selectedLocation.employees.map((employee) => (
        <div key={employee.id} onClick={() => handleEmployeeSelect(employee)}>
          <p>{employee.name}</p>
        </div>
      ))}
    </div>
  );
};

export default SelectEmployee;
