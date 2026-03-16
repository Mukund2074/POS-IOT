import { Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
interface Props {
  mainTitle: string;
  mainValue: string;
  sub1Title?: string;
  sub1Value?: string;
  sub2Title?: string;
  sub2Value?: string;
  showBottomBorder?: boolean;
  showTopBorder?: boolean;
  showTitle1?: boolean;
  showTitle2?: boolean;
  vatText?: boolean;
}

const POSCashDrawerSalesBreakdownText = ({
  mainTitle,
  mainValue,
  sub1Title,
  sub1Value,
  sub2Title,
  sub2Value,
  showBottomBorder = false,
  showTopBorder = false,
  showTitle1 = true,
  showTitle2 = true,
  vatText = false,
}: Props) => {
  return (
    <Stack
      sx={{
        width: '100%',
        borderBottom: showBottomBorder ? '1px solid #e6e6e6' : 'none',
        borderTop: showTopBorder ? '1px solid #e6e6e6' : 'none',
        pb: 1,
        px: 2,
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#fff',
      }}
    >
   
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{
          width: '100%',
          mt: 1,
          gap: 2,
        }}
      >
        <POSHeading
          text={mainTitle}
          sx={{
            fontSize: vatText ? 13.5 : 15,
            fontStyle: vatText ? 'italic' : 'normal',
            fontWeight: vatText ? 300 : 600,
            color: vatText ? '#333' : '#1F1F1F',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            flexGrow: 1,
            textAlign: 'left',
          }}
        />
        <POSHeading
          text={mainValue}
          sx={{
            fontWeight: 300,
            fontSize: 14.5,
            fontStyle: vatText ? 'italic' : 'normal',
            color: vatText ? '#455' : '#1F1F1F',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            textAlign: 'right',
            wordBreak: 'break-word',
          
          }}
        />
      </Stack>

      {showTitle1 && sub1Title && sub1Value && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{
            width: '100%',
            mt: -0.8,
            gap: 2,
          }}
        >
          <POSHeading
            text={sub1Title}
            sx={{
              fontWeight: 300,
              fontSize: 14,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              flexGrow: 1,
              textAlign: 'left',
              color: '#333',
            }}
          />
          <POSHeading
            text={sub1Value}
            sx={{
              fontWeight: 300,
              fontSize: 14,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textAlign: 'right',
              color: '#333',
            }}
          />
        </Stack>
      )}

      {/* Sub Title 2 */}
      {showTitle2 && sub2Title && sub2Value && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{
            width: '100%',
            mt: -0.8,
            gap: 2,
          }}
        >
          <POSHeading
            text={sub2Title}
            sx={{
              fontWeight: 300,
              fontSize: 14,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              flexGrow: 1,
              textAlign: 'left',
              color: '#333',
            }}
          />
          <POSHeading
            text={sub2Value}
            sx={{
              fontWeight: 300,
              fontSize: 14,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textAlign: 'right',
              color: '#333',
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default POSCashDrawerSalesBreakdownText;
