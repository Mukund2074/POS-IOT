import { IconButton, Modal, Paper, Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSCashDrawerText from '../POSCashDrawerText';
import POSButton from '@/components/POS/Common/POSButton';
import POSCheckbox from '@/components/POS/Common/POSCheckbox';
import { Close } from '@mui/icons-material';
import { t } from 'i18next';
import { FormikProps } from 'formik';
import { CashDrawerData } from '../../Types/cash-drawer.types';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import POSTextArea from '@/components/POS/Common/POSTextArea';

interface Props {
    open: boolean;
    onClose: () => void;
    onApprove: () => void;
    formik: FormikProps<CashDrawerData>;
    period: string;
    storeName: string;
    selectedEmployee: string;
}

const ConfirmCashDrawerModal = ({ open, onClose, onApprove, formik, period, storeName, selectedEmployee }: Props) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Paper
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    width: { xs: '100%', sm: '70%', md: '50%' },
                    maxWidth: '98%',
                    mx: 'auto',
                    my: 'auto',
                    position: 'relative',
                    maxHeight: '90%',
                    overflow: 'hidden',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                }}
            >
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                >
                    <Close />
                </IconButton>

                <Stack alignItems="center" spacing={2}>
                    <Stack
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#E0F7FA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Stack component="span" fontSize={40} color="#00ACC1">
                            &#33;
                        </Stack>
                    </Stack>

                    <POSHeading
                        text={t('POS.CashDraweerModalTitle')}
                        sx={{ fontWeight: 500, fontSize: 16, textAlign: 'center', color: '#333' }}
                    />

                    <Stack
                        sx={{
                            width: '100%',
                            display: 'flex',
                            mt: 2,
                            border: '1px solid #e6e6e6',
                            borderRadius: 2,
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <POSCashDrawerText
                            title={t('POS.CashDrawerBadge1Text')}
                            text={storeName}
                            showTopBorder={false}
                            sx={{
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                pr: 1,
                            }}
                            titleStyle={{
                                pl: {
                                    xs: 1,
                                    sm: 5,
                                },
                            }}
                        />
                        <POSCashDrawerText
                            title={t('POS.CashDrawerReconciledByemploye')}
                            text={selectedEmployee || ''}
                            sx={{ pr: 1 }}
                            titleStyle={{
                                pl: {
                                    xs: 1,
                                    sm: 5,
                                },
                            }}
                        />
                        <POSCashDrawerText
                            title={t('POS.CashDrawerBadge2Text')}
                            text={period}
                            sx={{ pr: 1 }}
                            titleStyle={{
                                pl: {
                                    xs: 1,
                                    sm: 5,
                                },
                            }}
                        />
                        <POSCashDrawerText
                            title={t('POS.CashDrawerDIFFERENCE')}
                            text={formatCurrency(formik.values.bankDifference)}
                            sx={{ pr: 1 }}
                            titleStyle={{
                                pl: {
                                    xs: 1,
                                    sm: 5,
                                },
                               
                            }}

                            textStyle={{ color: formik.values.bankDifference < 0 ? 'red' : formik.values.bankDifference > 0 ? 'green' : 'black',}}
                        />
                        <POSCashDrawerText
                            title={t('POS.CashDrawerForNextDay')}
                            text={formatCurrency(formik.values.remainingCashForNextDay)}
                            titleStyle={{
                                fontWeight: 700,
                                textAlign: 'left',
                                minWidth: 'fit-content',
                                textWrap: 'wrap',
                                pl: { xs: 1, sm: 5 },
                                
                            }}
                            showBottomBorder={false}
                            sx={{
                                borderBottomLeftRadius: 12,
                                borderBottomRightRadius: 12,
                                whiteSpace: 'nowrap',
                                pr: 1,
                            }}
                            textStyle={{ color: formik.values.remainingCashForNextDay < 0 ? 'red' : formik.values.remainingCashForNextDay > 0 ? 'green' : 'black',}}
                        />
                    </Stack>

                    <Stack
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            mt: 2,
                        }}
                    >
                        <POSCheckbox
                            checked={formik.values.addNoteToVoteCheck}
                            onClick={() =>
                                formik.setFieldValue('addNoteToVoteCheck', !formik.values.addNoteToVoteCheck)
                            }
                        />
                        <POSHeading
                            text={t('POS.CashDrawerNote')}
                            sx={{ fontWeight: 500, fontSize: 16, color: '#333' }}
                        />
                    </Stack>

                    {formik.values.addNoteToVoteCheck && (
                        <POSTextArea
                            value={formik.values.addNoteToVote}
                            onChange={(e) => formik.setFieldValue('addNoteToVote', e.target.value)}
                        />
                    )}

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mt={3}>
                        <POSButton
                            title={t('POS.UndoBUttonTitle')}
                            onClick={onClose}
                            variant="f_outline"
                            titleColor="#000"
                            width={{
                                xs: '100%',
                                sm: 'auto',
                            }}
                        />
                        <POSButton
                            title={t('POS.ApproveButtonTitle')}
                            onClick={onApprove}
                            variant="save"
                            loading={formik.isSubmitting}
                            disabled={formik.isSubmitting}
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Modal>
    );
};

export default ConfirmCashDrawerModal;
