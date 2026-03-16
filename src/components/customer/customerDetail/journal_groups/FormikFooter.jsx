import { Delete } from '@mui/icons-material';
import { Grid2, IconButton, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import React from 'react'
import AddJournalGroupTemplate from './AddJournalGroupTemplate';
import { useSelector } from 'react-redux';

const FormikFooter = ({ journals, setStoreImages, setIsOpen, setPhotoIndex, setShowDeleteModal, setJournalDeleteId, isDelete, setUSeTemplate, item, setOpen, formik, open }) => {

  const settings = useSelector((state) => state.settings.data);

  const TitleText = ({ title, sx }) => {
    return (
      <Typography variant="body1" fontWeight={800} color="text.secondary" sx={{ ...sx }}>
        {title}
      </Typography>
    )
  }

  const DescriptionText = ({ text, sx }) => {
    return (
      <Typography color="#545454" sx={{ ...sx }}>
        {text}
      </Typography>
    )
  }


  return (
    <React.Fragment>
      {journals && journals.map((ar) => ar.post && (
        <Grid2 container spacing={3}
          key={ar.id}
          sx={{
            border: "1.5px solid  #D9D9D9",
            // height: "100%",
            p: 2,
            width: "100%",
            position: "relative",
            mt: 2,
            borderRadius: 2,
          }}
        >
          {settings?.from_dashboard &&
            <IconButton
              loading={isDelete}
              onClick={() => {
                setShowDeleteModal(true);
                setJournalDeleteId(ar.id);
              }}
              color="red"
              sx={{ position: "absolute", top: 0, right: 0 }} >
              <Delete color="red" />
            </IconButton>
          }

          <Grid2 size={{ xs: 12, md: 2 }} sx={{ px: 2 }}>
            <TitleText title={t("Customer.WrittenBy")} />
            <DescriptionText text={ar.employee_name} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 10 }} sx={{ px: 2, overflowX: 'scroll', display: 'flex', flexDirection: 'row', scrollbarWidth: 'none', gap: 2, overflowY: 'hidden', width: '100%', maxHeight: 100 }}>
            {ar.attachments.map((item, index) => (
              <img
                onClick={() => {
                  setPhotoIndex(index);
                  setIsOpen(true);
                  let imgArray = [];
                  ar.attachments.map((attachment) =>
                    imgArray.push({
                      src: `${process.env.REACT_APP_IMG_URL}${attachment.attachment}`,
                    })
                  );

                  setStoreImages(imgArray);
                }}
                key={item.id}
                src={
                  item.attachment &&
                    typeof item.attachment === "string"
                    ? `${process.env.REACT_APP_IMG_URL}${item.attachment}`
                    : URL.createObjectURL(item)
                }
                alt=" "
                style={{
                  width: 100,
                  maxHeight: 100,
                  objectFit: "cover",
                  cursor: 'pointer'
                }}
              />
            ))}
          </Grid2>

          <Grid2 size={{ xs: 12, md: 2 }} sx={{ px: 2 }}>
            <TitleText title={t("Common.Date")} />
            <DescriptionText text={moment.parseZone(ar.journal_datetime).format("DD-MM-YYYY")} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 10 }} sx={{ px: 2 }}>
            {ar.title}
          </Grid2>

          <Grid2 size={{ xs: 12, md: 2 }} sx={{ px: 2 }}>
            <TitleText title={t("Common.Time")} />
            <DescriptionText text={moment.parseZone(ar.journal_datetime).format("HH:mm")} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 10 }} sx={{ px: 2 }}>
            <div
              style={{ marginTop: "8px" }}
              dangerouslySetInnerHTML={{
                __html: ar.journal_entry || "",
              }}
            />
          </Grid2>

        </Grid2 >
      )
      )}
      <AddJournalGroupTemplate
        open={open}
        onClose={() => setOpen(false)}
        val={formik.values.journal_entry}
        groupID={item.group_id}
        setUSeTemplate={setUSeTemplate}
      />
    </React.Fragment>
  )

}

export default FormikFooter