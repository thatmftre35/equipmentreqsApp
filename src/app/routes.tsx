import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { CallOffForm } from "./components/CallOffForm";
import { RentalRequestForm } from "./components/RentalRequestForm";
import { OwnedEquipmentForm } from "./components/OwnedEquipmentForm";
import { ProjectsManagement } from "./components/ProjectsManagement";
import { EquipmentManagement } from "./components/EquipmentManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: CallOffForm },
      { path: "rental-request", Component: RentalRequestForm },
      { path: "owned-equipment", Component: OwnedEquipmentForm },
      { path: "projects", Component: ProjectsManagement },
      { path: "equipment", Component: EquipmentManagement },
    ],
  },
]);
