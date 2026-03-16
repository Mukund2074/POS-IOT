import { Button, Modal, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CommonServiceModal from "./CommonServiceModal";
import FButton from "../../../commonComponents/F_Button";
import FSelect from "../../../commonComponents/F_Select";
import { toast } from "react-toastify";
import FTextInput from "../../../commonComponents/F_TextInput";
import { useFormik } from "formik";
import apiFetcher from "../../../../utils/interCeptor";
import { useParams } from "react-router-dom";
import { t } from "i18next";

const ArchiveJournalModal = ({
  ArchiveJournalModalOpen,
  setArchiveJournalModalOpen,
  dataa,
  Archieve,
  setProvoke,
  prove,
}) => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [archive, setArchive] = useState(-1);
  const [showTextField, setShowTextField] = useState(true);
  const [filteredData, setFilteredData] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: async (values) => {
      if (!data) return toast.error(t("Customer.JournalselectError"));

      const indexes = Object.values(selectedIds).flatMap((ids) => ids).sort((a, b) => b - a);

      if (indexes.length === 0) return toast.error(t("Customer.JournalselectError"));

      if (archive === -1 && formik.values.name === "") return toast.error("Please select an archive or create one");

      if (values.name !== "") {
        try {
          const obj = {
            name: values.name,
            journal_ids: indexes,
            outlet_customer_id: id,
          };
          await apiFetcher.post("/api/v1/store/archive", obj).then((res) => {
            if (res.data.success) {
              toast.success(t("Customer.JournalArchieveCreatedSuccess"));
              setSelectedIds([]);
              const timeout = setTimeout(() => {
                setArchiveJournalModalOpen((prev) => !prev);
                setProvoke(prove + 1);
              }, 700);
              return () => clearTimeout(timeout);
            }
          });
        } catch (error) {
          toast.success(t("Customer.JournalResponseError"));
          console.error("error", error);
        }
      } else {
        try {
          const obj = {
            archive_id: archive,
            journal_ids: indexes,
          };
          await apiFetcher.patch("/api/v1/store/archive", obj).then((res) => {
            if (res.data.success) {
              toast.success(t("Customer.JournalArchieveCreatedSuccess"));
              setSelectedIds([]);
              setArchive(null);
              const timeout = setTimeout(() => {
                setArchiveJournalModalOpen((prev) => !prev);
                setProvoke(prove + 1);
              }, 700);
              return () => clearTimeout(timeout);
            }
          });
        } catch (error) {
          toast.error(t("Customer.JournalResponseError"));
          console.error("error", error);
        }
      }
    },
  });

  const op = [
    {
      value: -1, // Generate a random ID
      label: t("Customer.CrNArch"),
    },
    ...Archieve.map((itemm) => ({
      value: itemm.id,
      label: itemm.name,
    })),
  ];

  const check = dataa.map((d) => d.journals.length).every((item) => item === 0);

  useEffect(() => {
    const fd = dataa.map((item) => ({
      ...item,
      journals: item.journals.filter((j) => j.post !== false),
    }));
    setFilteredData(fd);


  }, [dataa]);




  return (
    <Modal
      open={ArchiveJournalModalOpen}
      onClose={() => setArchiveJournalModalOpen(false)}
      disableAutoFocus
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        sx={{
          maxHeight: "95%",
          width: { xs: "90%", md: "70%" },
          borderRadius: "10px",
          p: { xs: 2, md: 4 },
          overflowY: "scroll",
          maxHeight: "90%",
          scrollbarWidth: "none",
        }}
      >
        <Typography variant="body1" fontWeight={700} display={"flex"}>
          {t("Customer.Archive")}
        </Typography>

        <Stack
          sx={{ display: "flex", gap: 1, flexDirection: "column", mt: 2 }}
        >
          <Typography>{t("Customer.ChArchive")}</Typography>
          <FSelect
            defaultValue={-1}
            value={archive || -1}
            placeholderText={t("Customer.Archive")}
            onChange={(e) => {
              if (e.target.value == -1) {
                setArchive(null);
                setShowTextField(true);
              } else {
                setShowTextField(false);
                formik.setFieldValue("name", "");
                setArchive(e.target.value);
              }
            }}
            options={op}
            sx={{ width: { xs: '100%', md: "20%" } }}
          />
        </Stack>

        {showTextField && (
          <Stack
            sx={{ display: "flex", gap: 1, flexDirection: "column", mt: 1 }}
          >
            <Typography>{t("Customer.ArchName")}</Typography>
            {/* <FSelect placeholderText="Archive name" sx={{width:"20%"}}/> */}
            <FTextInput
              onChange={formik.handleChange}
              id={"name"}
              value={formik.values.name}
              placeholder={t("Customer.ArchName")}
              mt={0}
              sx={{
                border: "1.5px solid #D9D9D9",
                color: "#A0A0A0",
                fontWeight: 400,
                width: { xs: '100%', md: "20%" }
              }}
              borderRadius="13px"
            />
          </Stack>
        )}

        {check ? (
          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.6)",
              mb: 3,
            }}
          >
            {t("Customer.NoJournal")}
          </Typography>
        ) : (
          <CommonServiceModal
            height={"65%"}
            mt={2}
            setData={setData}
            archive={filteredData}
            isJournalModal={true}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}

        <Stack
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: "space-between",
            gap: 2
          }}
        >


          <Button
            onClick={() => setArchiveJournalModalOpen(false)}
            disableRipple={true}
            sx={{
              px: 4,
              textTransform: "none",
              borderRadius: "25px",
              color: "white",
              width: { xs: '100%', md: 'auto' },
              backgroundColor: "#D9D9D9",
              height: 40,
            }}
          >
            <Typography style={{ fontWeight: 700, }}>
              {t("Common.Back")}
            </Typography>
          </Button>

          <FButton
            titleColor={"white"}
            disabled={
              (!archive && !formik.values.name) || selectedIds.length < 0
            }
            sx={{ my: "auto" }}
            onClick={formik.handleSubmit}
            title={t("Customer.ArchChoosen")}
            variant={"save"}
          />
        </Stack>

      </Paper>
    </Modal>
  );
};

export default ArchiveJournalModal;
