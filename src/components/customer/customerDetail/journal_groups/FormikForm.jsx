import React from 'react';
import FButton from '../../../commonComponents/F_Button';
import { Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import ReactQuill from 'react-quill';
import FPersonalSelect from './FPersonalSelect';
import FTextInput from '../../../commonComponents/F_TextInput';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';

const modules = {
    toolbar: [
        // [{ font: ["Arial", "sans-serif"] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
    ],
    clipboard: {
        matchVisual: false, // Ensures Quill inserts proper <p> tags
    },
};

const formats = [
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'blockquote',
    'code-block',
    'list',
    'script',
    'indent',
    'direction',
    'align',
    'link',
    'image',
    'video',
    'header',
];

const FormikForm = ({
    formik,
    item,
    changeSequence,
    arrow,
    user,
    useTemplate,
    setSelectedTemplateName,
    setOpen,
    selectedTemplatename,
    // fileName,
    // setFileName,
    // setDeleteidx,
    ispending,
    // setShowSaveModal,
    template,
    uploadJournalImages,
    handleRemoveImage,
    journalImages,
}) => {
    const isMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const op = [
        ...useTemplate.map((itemm) => ({
            value: itemm?.id,
            label: itemm?.name,
        })),
        {
            value: -1, // Generate a random ID
            label: '+ Save draft as a template',
        },
    ];
    const mobileTemplates = template?.find((temp) => temp.id == null);
    const mobileOptions = [
        ...(useTemplate ?? []).map((itemm) => ({
            value: itemm?.id,
            label: itemm?.name,
        })),
        ...(mobileTemplates?.templates ?? []).map((itemm) => ({
            value: itemm?.id,
            label: itemm?.name,
        })),
        {
            value: -1,
            label: '+ Save draft as a template',
        },
    ];

    return (
        <>
            <Stack
                sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 2,
                }}
            >
                {' '}
                <FPrimaryHeading
                    fontColor="#545454"
                    fontSize="22px"
                    text={item?.group_id === 0 ? t('Common.UngroupedJournals') : item?.group_name}
                />
                <Stack
                    sx={{
                        display: item?.group_id === 0 ? 'none' : 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        my: 'auto',
                    }}
                >
                    <Stack
                        onClick={() => {
                            // setInitialValues({
                            //   id: null,
                            //   type: "",
                            //   writer: "",
                            //   title: "",
                            //   template_id: null,
                            //   journal_entry: ``,
                            //   images: [],
                            //   group_id: null,
                            // });
                            // setFileName([]);
                            changeSequence(item?.group_id, 'down');
                        }}
                        sx={{
                            '&:hover': { cursor: 'pointer' },
                            backgroundColor: '#D9D9D9',
                            p: 1,
                            borderRadius: '50%',
                        }}
                    >
                        <Stack
                            component={'img'}
                            src={arrow}
                            alt="arr"
                            sx={{ height: 18, width: 18, objectFit: 'contain' }}
                        />
                    </Stack>

                    <Stack
                        onClick={() => {
                            // setInitialValues({
                            //   id: null,
                            //   type: "",
                            //   writer: "",
                            //   title: "",
                            //   template_id: null,
                            //   journal_entry: ``,
                            //   images: [],
                            //   group_id: null,
                            // });
                            // setFileName([]);
                            changeSequence(item?.group_id, 'up');
                        }}
                        sx={{
                            '&:hover': { cursor: 'pointer' },
                            backgroundColor: '#D9D9D9',
                            p: 1,
                            borderRadius: '50%',
                        }}
                    >
                        <Stack
                            component={'img'}
                            src={arrow}
                            alt="arr"
                            sx={{
                                height: 18,
                                width: 18,
                                objectFit: 'contain',
                                rotate: '180deg',
                            }}
                        />
                    </Stack>
                </Stack>
            </Stack>

            <Stack
                sx={{
                    border: `1.5px solid  #D9D9D9`,
                    height: '100%',
                    width: '100%',
                    display: item?.group_id === 0 ? 'none' : 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                }}
            >
                <FTextInput
                    id={`writer`}
                    value={user?.name}
                    disabled
                    placeholder="Written by"
                    sx={{
                        width: '100%',
                        border: 'no3ne',
                        mt: 0,
                        // backgroundColor: item?.group_id === 0 && "#D9D9D9",
                        borderBottom: '1.5px solid  #D9D9D9',
                        borderBottomRightRadius: 0,
                        borderBottomLeftRadius: 0,
                    }}
                />

                {formik.errors.writer && formik.touched.writer && (
                    <Stack component={'span'} style={{ color: 'red', fontSize: '12px', marginLeft: 10 }}>
                        {formik.errors.writer}
                    </Stack>
                )}

                <FTextInput
                    // id={`title${item.group_id}`}

                    value={formik.values.title}
                    onChange={(e) => {
                        formik.setFieldValue('title', e.target.value);
                    }}
                    placeholder={t('Customer.TitleOfJournal')}
                    sx={{
                        border: 'none',
                        // backgroundColor: item?.group_id === 0 && "#D9D9D9",
                        // color: item?.group_id === 0 && "#545454",
                        mt: 0,
                        borderBottom: '1.5px solid  #D9D9D9',
                        borderBottomRightRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                    }}
                />

                {formik.errors.title && formik.touched.title && (
                    <Stack component={'span'} style={{ color: 'red', fontSize: '12px', marginLeft: 10 }}>
                        {formik.errors.title}
                    </Stack>
                )}
                <Stack p={0.5} display={'flex'} flexDirection={'row'} gap={2}>
                    <FPersonalSelect
                        id={`template_id${item.group_id}`}
                        value={formik.values.template_id === null ? null : formik.values.template_id}
                        onChange={(e) => {
                            let selectedName;

                            if (item?.group_id === 0) {
                                selectedName = mobileTemplates?.templates.find(
                                    (item) => item.id === e.target.value
                                )?.name;

                                if (!selectedName) {
                                    selectedName = useTemplate?.find((itemm) => itemm.id === e.target.value)?.name;
                                }
                            } else {
                                selectedName = useTemplate?.find((itemm) => itemm.id === e.target.value)?.name;
                            }
                            if (selectedName) {
                                setSelectedTemplateName(selectedName);
                            }
                            if (typeof e.target.value === 'number') {
                                if (e.target.value == -1) {
                                    setOpen(true);
                                    return;
                                }

                                if (item?.group_id === 0) {
                                    formik.setFieldValue(
                                        'journal_entry',
                                        mobileTemplates?.templates.find((item) => item.id === e.target.value)?.detail
                                            ? mobileTemplates?.templates.find((item) => item?.id === e?.target?.value)
                                                  ?.detail
                                            : useTemplate.find((item) => item?.id === e?.target?.value)?.detail
                                    );
                                    formik.setFieldValue(`template_id`, e.target.value);
                                    return;
                                } else {
                                    formik.setFieldValue(
                                        'journal_entry',
                                        useTemplate.find((item) => item.id === e.target.value)?.detail
                                    );
                                    formik.setFieldValue(`template_id`, e.target.value);
                                    return;
                                }
                            }
                        }}
                        options={item?.group_id === 0 ? mobileOptions : useTemplate && op}
                        showPlaceHolder={true}
                        placeholderText={
                            selectedTemplatename ? selectedTemplatename : t('Customer.JournalChooseTemplate')
                        }
                        sx={{ width: { xs: '100%', md: '30%' }, height: 35 }}
                    />
                    {/* 
          <FButton
            type={"button"}
            title={"+ Add new template"}
            sx={{
              width: "18%",
              height: 35,
              px: 0,
              backgroundColor: "#D9D9D9",
            }}
            variant={"save"}
          /> */}
                </Stack>

                <ReactQuill
                    id={item.group_id}
                    value={formik.values.journal_entry}
                    onChange={(value) => {
                        formik.setFieldValue('template_id', null);
                        formik.setFieldValue(`journal_entry`, value);
                    }}
                    modules={modules}
                    formats={formats}
                    className={'yug-quill'}
                    style={{
                        border: 'none',
                        borderRadius: 0,
                        width: '100%',
                    }}
                />
                {formik.errors.journal_entry && formik.touched.journal_entry && (
                    <Stack component={'span'} style={{ color: 'red', fontSize: '12px' }}>
                        {formik.errors.journal_entry}
                    </Stack>
                )}

                <Stack
                    display={'flex'}
                    flexDirection={{ xs: 'column', md: 'row' }}
                    gap={2}
                    // height={40}
                    pr={{xs : 0 , md :2}}
                    borderTop={'1.5px solid #D9D9D9'}
                >
                    <Stack
                        sx={{
                            width: { xs: '100%', md: '15%' },
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: { xs: 'flex-start', md: 'center' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 1,
                            borderRight: { xs: 'none', md: `1.5px solid  #D9D9D9` },
                        }}
                    >
                        <Typography sx={{ width: '100%', textAlign: 'center' }} noWrap color={'#BBB0A4'}>
                            {t('Customer.JournalUploadImg')}
                        </Typography>
                    </Stack>

                    <input
                        multiple
                        type="file"
                        accept=".jpg, .jpeg, .png, .heif, image/jpeg, image/png, image/heif"
                        style={{ display: 'none' }}
                        id={`image-upload${item.group_id}`}
                        onChange={(e) => uploadJournalImages(e)}
                    />
                    <label
                        htmlFor={`image-upload${item.group_id}`}
                        style={{
                            width: isMd ? '100%' : '15%',
                            marginLeft :'auto',
                            marginRight : 'auto'
                        }}
                    >
                        <Button
                            id={item.group_id}
                            type="button"
                            disableRipple
                            component="span"
                            sx={{
                                border: '1px solid #000000',
                                width: '100%',
                                px: 2,
                                backgroundColor: '#D9D9D9',
                                color: 'black',
                                textTransform: 'capitalize',
                            }}
                        >
                            <Typography noWrap variant={{ xs: 'caption', md: 'body1' }}>
                                {t('Customer.JournalChooseImg')}
                            </Typography>
                        </Button>
                    </label>

                    <Stack
                        color="#BBB0A4"
                        ml={2}
                        sx={{
                            width: { xs: '100%', md: '70%' },
                            overflowX: 'scroll',
                            scrollbarWidth: 'none',
                            // height: 32,
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            whiteSpace: 'nowrap',
                            pr: 1,
                        }}
                    >
                        {journalImages?.length > 0 ? (
                            journalImages?.map((item, index) => (
                                <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton
                                        disableRipple
                                        onClick={() => handleRemoveImage({ id: item?.id })}
                                        size="small"
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                    <Typography
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        variant={{ xs: 'caption', md: 'body1' }}
                                    >
                                        {item?.attachment_name}
                                    </Typography>{' '}
                                </span>
                            ))
                        ) : (
                            <span style={{ marginTop: 3.5 }}>{t('Customer.JournlNoFileSelected')}</span>
                        )}
                    </Stack>
                </Stack>

                <Stack
                    sx={{
                        width: '100%',
                        height: 40,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: 2,
                        px: 3,
                        mt: 0,
                        borderTop: '1.5px solid #D9D9D9',
                    }}
                >
                    <FButton
                        disabled={ispending}
                        titleColor={'white'}
                        type={'button'}
                        // onClick={() => {
                        //   // setShowSaveModal(true);

                        // }}
                        onClick={() => {
                            formik.setFieldValue('group_id', item.group_id);
                            formik.setFieldValue('type', 'save');

                            formik.handleSubmit();
                        }}
                        title={t('Customer.JournalSave')}
                        sx={{
                            width: { xs: '50%', md: '10%' },
                            height: 30,
                            px: 0,
                            my: 'auto',
                            backgroundColor: '#E19957',
                        }}
                        variant={'delete'}
                    />

                    <FButton
                        disabled={ispending}
                        type={'button'}
                        onClick={() => {
                            formik.setFieldValue('group_id', item.group_id);

                            formik.setFieldValue('type', 'post');
                            formik.handleSubmit();
                        }}
                        titleColor={'white'}
                        title={t('Customer.JournalPost')}
                        sx={{
                            width: { xs: '50%', md: '18%' },
                            height: 32,
                            px: 0,
                            my: 'auto',
                            color: 'white',
                        }}
                        variant={'save'}
                    />
                </Stack>
            </Stack>
        </>
    );
};

export default FormikForm;
