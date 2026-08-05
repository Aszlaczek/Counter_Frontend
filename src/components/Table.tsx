import { usePersonListStore } from "../store";
import "../style/Table.css";
import ExcelJS from "exceljs";
import editIcon from "../assets/edit-svgrepo-com.svg";
import deleteIcon from "../assets/delete-svgrepo-com.svg";
import { personService } from "../services/personService";

type Props = {
  onUpdate: () => Promise<void>;
};

const Table = ({ onUpdate }: Props) => {
  const { list } = usePersonListStore();

  const handleEdit = (id: number) => {
    window.dispatchEvent(new CustomEvent("open-edit", { detail: { id } }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wpis?")) return;
    try {
      await personService.delete(id);
      await onUpdate();
    } catch {
      alert("Nie udało się usunąć wpisu.");
    }
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dane");

    worksheet.columns = [
      { header: "L.P.", key: "lp", width: 8 },
      { header: "Imię", key: "name", width: 20 },
      { header: "Nazwisko", key: "surname", width: 25 },
      { header: "Wydział", key: "faculty", width: 20 },
      { header: "Aktywny", key: "isWorking", width: 12 },
      { header: "Data utworzenia", key: "createdAt", width: 22 },
    ];

    list.forEach((person, i) => {
      worksheet.addRow({
        lp: i + 1,
        name: person.name,
        surname: person.surname,
        faculty: person.faculty,
        isWorking: person.is_working ? "Tak" : "Nie",
        createdAt: new Date(person.created_at).toLocaleString("pl-PL"),
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const date = new Date().toISOString().split("T")[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rozliczenie_${date}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (list.length === 0) return null;

  return (
    <div className="container-outer table-wrapper">
      <div className="table-header">
        <h3 className="table-title">Zapisane Dane</h3>
        {list.length >= 1 && (
          <button className="btn-export" onClick={handleExport}>
            Eksportuj do Excel
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>L.P.</th>
              <th>Imię</th>
              <th>Nazwisko</th>
              <th>Wydział</th>
              <th>Aktywny</th>
              <th>Opcje</th>
            </tr>
          </thead>
          <tbody>
            {list.map((person, i) => (
              <tr key={person.id}>
                <td>{i + 1}</td>
                <td>{person.name}</td>
                <td>{person.surname}</td>
                <td>{person.faculty}</td>
                <td>{person.is_working ? "Tak" : "Nie"}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(person.id)}
                      title="Edytuj"
                    >
                      <img src={editIcon} alt="Edytuj" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(person.id)}
                      title="Usuń"
                    >
                      <img src={deleteIcon} alt="Usuń" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
