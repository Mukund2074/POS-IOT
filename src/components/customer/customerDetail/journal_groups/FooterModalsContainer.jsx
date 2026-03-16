import { t } from "i18next";
import CustomDeleteModal from "../../../deleteAlertModal";
import ImageViewer from "./ImageViewer";
import apiFetcher from "../../../../utils/interCeptor";
import { toast } from "react-toastify";
import SaveModal from "../Advanced-journal/popup/SaveModal";

export const FooterModalsContainer = ({
  isOpen,
  setIsOpen,
  photoIndex,
  storeImages,
  showSaveModal,
  setShowSaveModal,
  showDeleteModal,
  setShowDeleteModal,
  JournalDeleteId,
  setISDelete,
  formik,
  item,
  journals,
  setData
}) => {

    const handleDelete = async (ID) => {
        const find = journals.find((item) => item.id === ID);
    
        if (find) {
          try {
            await apiFetcher
              .delete(`api/v1/store/journal/${ID}`)
              .then((res) => {
                if (res.data.success) {
                  toast.success(t("Customer.JournalResponseDeleteSuccess"));
                  setISDelete(false);
                  setData((prevGroups) => {
                    return prevGroups?.map((group) => {
                      if (group.group_id === item.group_id) {
                        return {
                          ...group,
                          journals: group.journals.filter(
                            (journal) => journal.id !== ID
                          ),
                        };
                      }
    
                      return group;
                    });
                  });
                }
              });
          } catch (error) {
            console.error("error", error);
            setISDelete(false);
          }
        }
      };
    
  return (

    
    <>
      <ImageViewer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        photoIndex={photoIndex}
        storeImages={storeImages}
      />
      {showSaveModal && (
        <SaveModal
          dismissColor={"#fff"}
          dismissBg={"#D9D9D9"}
          ConfirmColor={"#fff"}
          ConfirmBg={"#44B904"}
          open={true}
          handleClose={() => setShowSaveModal(false)}
          onClickDismiss={() => setShowSaveModal(false)}
          onClickConfirm={() => {
            formik.setFieldValue("group_id", item.group_id);
            formik.setFieldValue("type", "save");

            formik.handleSubmit();
          }}
          title={t("Customer.SaveChanges")}
          description={t("Customer.SaveChangesDesc")}
        />
      )}
      {showDeleteModal && (
        <CustomDeleteModal
          open={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          description={
            <>
              {t("Setting.AreYouSureYouWantToDelete")}
              <span
                style={{
                  marginLeft: 5,
                  color: "#1F1F1F",
                  fontWeight: "bold",
                  marginRight: 5,
                }}
              >
                {t("Customer.JournalGrroupdelh")}
              </span>
            </>
          }
          onClickDismiss={() => setShowDeleteModal(false)}
          onClickConfirm={() => {
            setISDelete(true);
            setShowDeleteModal(false);

            handleDelete(JournalDeleteId);
          }}
        />
      )}
    </>
  );
};
