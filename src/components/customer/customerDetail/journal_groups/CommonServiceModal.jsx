import { Box, Divider, Stack, Typography } from "@mui/material";
import CustomCheckbox from "../../../commonComponents/F_Checkbox";
import { t } from "i18next";
import { useEffect, useState } from "react";
import moment from "moment";

const CommonServiceModal = ({
  height,
  mt,
  setData,
  mb,
  archive,
  setSelectedIds,
  selectedIds,
  isJournalModal = false,
}) => {
  const [allSelectedInArchieve, setAllSelectedInArchieve] = useState(false);
  const langugae = localStorage.getItem("language");

  const handleCheckchange = (group, isParent = false, itemId = null) => {
    setSelectedIds((prevSelected) => {
      const selectedGroupIds = prevSelected[group.group_id] || [];
      const allChildIds = group.journals.map((item) => item.id);

      let newSelectedIds;

      if (isParent) {
        // Toggle all items in the group
        newSelectedIds = allChildIds.every((id) => selectedGroupIds.includes(id))
          ? []
          : allChildIds;
      } else {
        // Toggle a single item
        newSelectedIds = selectedGroupIds.includes(itemId)
          ? selectedGroupIds.filter((id) => id !== itemId)
          : [...selectedGroupIds, itemId];
      }

      setData((prevData) => {
        return prevData.map((g) => {
          if (g.group_id === group.group_id) {
            return {
              ...g,
              journals: g.journals.filter((item) => newSelectedIds.includes(item.id)), // Only keep selected journals
            };
          }
          return g;
        });
      });

      return { ...prevSelected, [group.group_id]: newSelectedIds };
    });
  };

  const initializeSelection = () => {
    archive.forEach((group) => {
      const allChildIds = group.journals.map((item) => item.id);
      setSelectedIds((prevSelected) => ({
        ...prevSelected,
        [group.group_id]: allChildIds,
      }));
    });
  };

  useEffect(() => {
    if (isJournalModal) {
      initializeSelection();
    }
  }, [archive, isJournalModal]);

  useEffect(() => {
    if (!isJournalModal) {
      const allIds = archive.map((com) => {
        return com.journals.every((item) => selectedIds[com.group_id]?.includes(item.id));
      });
      const valid = allIds?.every((item) => item === true);

      setAllSelectedInArchieve(valid);
    }
  }, [selectedIds]);

  const selectAllIdsFromArchieve = () => {
    if (!allSelectedInArchieve) {
      initializeSelection();
    } else {
      setSelectedIds([]);
    }
  };

  if (!archive.find((item) => item.journals.length > 0))
    return (
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "600",
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        {t("Customer.NoArchives")}
      </Typography>
    );

  return (
    <Stack
      sx={{
        mb: mb || 3,
        maxHeight: height || "75%",
        border: "1px solid #D9D9D9",
        overflowX: "auto", // ✅ Horizontal scroll
        overflowY: "auto", // ✅ Vertical scroll
        scrollbarWidth: "none",
        mt: mt || 1,
        borderRadius: 5,
      }}
    >
      <Box sx={{ minWidth: "900px" }}> {/* ✅ Set minWidth to enable scroll */}
        {/* Header Section */}
        <Stack
          direction="row"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            py: 0.5,
            backgroundColor: "#f1f1f1",
            px: 2,
            minWidth: "900px",
          }}
        >
          <Typography sx={{ fontWeight: 700, minWidth: 150 }}>{t("Common.Info")}</Typography>
          <Typography sx={{ fontWeight: 700, flex: 1 }}>{t("Customer.Journal")}</Typography>
          <Typography sx={{ fontWeight: 700, minWidth: 150 }}>{t("Common.Picture")}</Typography>
          <Box sx={{ minWidth: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography fontWeight={700} sx={{ mr: 1 }}>
              {t("Common.Choose")}
            </Typography>
            {!isJournalModal && (
              <CustomCheckbox
                checked={allSelectedInArchieve}
                onChange={selectAllIdsFromArchieve}
                sx={{ mt: 0, mb: 0 }}
              />
            )}
          </Box>
        </Stack>

        {/* Journal Rows */}
        <Stack sx={{ maxHeight: "50%" }}>
          {archive &&
            archive.map((com) => {
              if (!com?.journals?.length) return;
              const selectedGroupIds = selectedIds[com?.group_id] || [];
              const allChildrenSelected = com?.journals?.every((item) =>
                selectedGroupIds?.includes(item?.id)
              );

              return (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      px: 2,
                      backgroundColor: "#F8F8F8",
                      minWidth: "900px",
                    }}
                  >
                    <Typography sx={{ minWidth: 150, fontWeight: 700 }}>{com?.group_name}</Typography>
                    <Box sx={{ flex: 1 }} />
                    <Box sx={{ minWidth: 100, display: "flex", justifyContent: "center" }}>
                      <CustomCheckbox
                        checked={com.journals.length > 0 ? allChildrenSelected : false}
                        onChange={() => handleCheckchange(com, true)}
                      />
                    </Box>
                  </Box>

                  {/* Journal Details */}
                  {com.journals.map((group, index) => (
                    <>
                      <Stack key={group.id} sx={{ mb: 4, mt: 2 }}>
                        <Stack>
                          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, px: 2, flexWrap: "nowrap" }}>
                            <Box sx={{ minWidth: 150 }}>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" fontWeight={800} color="text.secondary">
                                  {t("Customer.WrittenBy")}
                                </Typography>
                                <Typography>{group?.employee_name}</Typography>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" fontWeight={800} color="text.secondary">
                                  {t("Common.Date")}
                                </Typography>
                                <Typography>{moment(group.created_at).format("DD/MM-YYYY")}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body1" fontWeight={800} color="text.secondary">
                                  {t("Common.Time")}
                                </Typography>
                                <Typography>{moment(group.created_at, "YYYY-MM-DDTHH:mm:ss").format("HH:mm")}</Typography>
                              </Box>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                                {group.title}
                              </Typography>
                              <div
                                style={{ marginTop: "8px" }}
                                dangerouslySetInnerHTML={{ __html: group.journal_entry || "" }}
                              ></div>
                            </Box>

                            <Stack sx={{ minWidth: 150, gap: 2 }}>
                              {group.attachments.map((item) => (
                                <Stack
                                  key={item.id}
                                  component="img"
                                  src={
                                    item.attachment && typeof item.attachment === "string"
                                      ? `${process.env.REACT_APP_IMG_URL}${item.attachment}`
                                      : URL.createObjectURL(item)
                                  }
                                  alt="Patient photo"
                                  sx={{
                                    width: "50%",
                                    ml: 1,
                                    borderRadius: 1,
                                    objectFit: "cover",
                                  }}
                                />
                              ))}
                            </Stack>

                            <Box sx={{ minWidth: 100, display: "flex", justifyContent: "center" }}>
                              <CustomCheckbox
                                checked={selectedGroupIds.includes(group.id)}
                                onChange={() => handleCheckchange(com, false, group.id)}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </Stack>
                      {index <= com.journals.length - 2 && <Divider sx={{ border: "2.5px solid #bbb" }} />}
                    </>
                  ))}
                </>
              );
            })}
        </Stack>
      </Box>
    </Stack>
  );
};

export default CommonServiceModal;
