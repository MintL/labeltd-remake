VERSION 5.00
Begin VB.Form Form1 
   BackColor       =   &H00404040&
   BorderStyle     =   0  'None
   Caption         =   "WarCraft 4 LabelTD"
   ClientHeight    =   7380
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   10020
   FillColor       =   &H00C0C0C0&
   Icon            =   "spel.frx":0000
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   ScaleHeight     =   7380
   ScaleWidth      =   10020
   ShowInTaskbar   =   0   'False
   StartUpPosition =   3  'Windows Default
   Begin VB.Frame frmMap 
      BackColor       =   &H00C0C0C0&
      Caption         =   "Instructions"
      Height          =   615
      Left            =   9240
      TabIndex        =   59
      Top             =   1680
      Width           =   615
      Visible         =   0   'False
      Begin VB.Label lblInst 
         BackColor       =   &H00C0C0C0&
         Height          =   2295
         Left            =   120
         TabIndex        =   62
         Top             =   240
         Width           =   1575
      End
   End
   Begin VB.Frame frmMenu 
      BackColor       =   &H00C0C0C0&
      Caption         =   "Menu"
      Height          =   615
      Left            =   9240
      TabIndex        =   56
      Top             =   960
      Width           =   615
      Visible         =   0   'False
      Begin VB.CommandButton menuMapedit 
         Caption         =   "Mapedit"
         Height          =   495
         Left            =   240
         TabIndex        =   63
         Top             =   240
         Width           =   1335
      End
      Begin VB.CommandButton menuBack 
         Caption         =   "Return"
         Height          =   495
         Left            =   240
         TabIndex        =   60
         Top             =   1440
         Width           =   1335
      End
      Begin VB.CommandButton menuInst 
         Caption         =   "Instructions"
         Height          =   495
         Left            =   240
         TabIndex        =   58
         Top             =   840
         Width           =   1335
      End
      Begin VB.CommandButton menuExit 
         Caption         =   "Exit"
         Height          =   495
         Left            =   240
         TabIndex        =   57
         Top             =   2040
         Width           =   1335
      End
   End
   Begin VB.Timer Timer2 
      Enabled         =   0   'False
      Interval        =   1
      Left            =   9480
      Top             =   4440
   End
   Begin VB.Frame FraDiff 
      BackColor       =   &H00808080&
      Caption         =   "Difficulty"
      Height          =   615
      Left            =   9240
      TabIndex        =   29
      Top             =   240
      Width           =   615
      Begin VB.CommandButton CmdLife20 
         Caption         =   "n00b (20)"
         Height          =   615
         Left            =   240
         TabIndex        =   33
         Top             =   2880
         Width           =   2415
      End
      Begin VB.CommandButton CmdLife10 
         Caption         =   "Average (10)"
         Height          =   615
         Left            =   240
         TabIndex        =   32
         Top             =   2040
         Width           =   2415
      End
      Begin VB.CommandButton CmdLife5 
         Caption         =   "Pro (5)"
         Height          =   615
         Left            =   240
         TabIndex        =   31
         Top             =   1200
         Width           =   2415
      End
      Begin VB.CommandButton CmdLife1 
         Caption         =   "Master (1)"
         Height          =   615
         Left            =   240
         TabIndex        =   30
         Top             =   360
         Width           =   2415
      End
   End
   Begin VB.Timer Timer1 
      Enabled         =   0   'False
      Interval        =   10
      Left            =   9480
      Top             =   4920
   End
   Begin VB.Image imgsdmg 
      Height          =   495
      Left            =   3900
      Picture         =   "spel.frx":08CA
      Stretch         =   -1  'True
      Top             =   6315
      Width           =   495
      Visible         =   0   'False
   End
   Begin VB.Image imgCheat 
      Height          =   135
      Left            =   0
      Top             =   0
      Width           =   135
   End
   Begin VB.Label lblback 
      BackColor       =   &H8000000C&
      Height          =   2295
      Index           =   0
      Left            =   1920
      TabIndex        =   61
      Top             =   240
      Width           =   735
   End
   Begin VB.Image imgQuad 
      Height          =   255
      Left            =   9600
      Picture         =   "spel.frx":15D6
      Stretch         =   -1  'True
      Top             =   2640
      Width           =   255
      Visible         =   0   'False
   End
   Begin VB.Image imgPent 
      Height          =   285
      Left            =   9600
      Picture         =   "spel.frx":6EEE
      Stretch         =   -1  'True
      Top             =   3360
      Width           =   285
      Visible         =   0   'False
   End
   Begin VB.Image imgExt 
      Height          =   255
      Left            =   9600
      Picture         =   "spel.frx":BC39
      Stretch         =   -1  'True
      Top             =   3000
      Width           =   255
      Visible         =   0   'False
   End
   Begin VB.Image imgP35 
      Height          =   255
      Left            =   9240
      Picture         =   "spel.frx":10AA8
      Stretch         =   -1  'True
      Top             =   3360
      Width           =   255
      Visible         =   0   'False
   End
   Begin VB.Image img680i 
      Height          =   255
      Left            =   9240
      Picture         =   "spel.frx":23245
      Stretch         =   -1  'True
      Top             =   3000
      Width           =   255
      Visible         =   0   'False
   End
   Begin VB.Image imgUpmobo 
      Height          =   545
      Left            =   1540
      Picture         =   "spel.frx":2C1B5
      Stretch         =   -1  'True
      Top             =   5520
      Width           =   560
      Visible         =   0   'False
   End
   Begin VB.Label LblMOBCASH 
      BackColor       =   &H00000000&
      Caption         =   "Mob:"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H8000000C&
      Height          =   240
      Left            =   6435
      TabIndex        =   55
      Top             =   6075
      Width           =   465
   End
   Begin VB.Label LblEarn 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00000000&
      Caption         =   "Earn"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6870
      TabIndex        =   54
      Top             =   6075
      Width           =   630
   End
   Begin VB.Line Line3 
      BorderColor     =   &H80000015&
      BorderWidth     =   2
      X1              =   7560
      X2              =   6360
      Y1              =   6570
      Y2              =   6570
   End
   Begin VB.Label lblspeed 
      BackColor       =   &H80000007&
      Caption         =   "speed"
      ForeColor       =   &H8000000A&
      Height          =   255
      Left            =   4920
      TabIndex        =   43
      Top             =   7080
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Label LblRange 
      BackColor       =   &H80000007&
      Caption         =   "Range"
      ForeColor       =   &H8000000A&
      Height          =   255
      Left            =   3840
      TabIndex        =   2
      Top             =   7080
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Label lblLvl 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00000000&
      Caption         =   "Lvl"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6960
      TabIndex        =   53
      Top             =   6300
      Width           =   580
   End
   Begin VB.Label LblLVLs 
      BackColor       =   &H00000000&
      Caption         =   "Level:"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H8000000C&
      Height          =   240
      Left            =   6435
      TabIndex        =   52
      Top             =   6300
      Width           =   585
   End
   Begin VB.Label lblTwrinf 
      BackColor       =   &H00000000&
      ForeColor       =   &H8000000A&
      Height          =   1155
      Left            =   7920
      TabIndex        =   51
      Top             =   6180
      Width           =   2040
   End
   Begin VB.Label walla 
      Caption         =   "Label2"
      Height          =   375
      Left            =   240
      TabIndex        =   50
      Top             =   4320
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Image imgbuild 
      Height          =   525
      Index           =   2
      Left            =   9360
      Picture         =   "spel.frx":2CA61
      Stretch         =   -1  'True
      Top             =   5580
      Width           =   615
   End
   Begin VB.Image imgbuild 
      Height          =   525
      Index           =   1
      Left            =   8640
      Picture         =   "spel.frx":2D6C8
      Stretch         =   -1  'True
      Top             =   5600
      Width           =   615
   End
   Begin VB.Label lbllvldmg 
      BackColor       =   &H00000000&
      ForeColor       =   &H8000000A&
      Height          =   1200
      Left            =   90
      TabIndex        =   48
      Top             =   6120
      Width           =   2040
   End
   Begin VB.Image ImgTwr1 
      Height          =   465
      Index           =   0
      Left            =   1.00000e5
      Picture         =   "spel.frx":2FEFA
      Stretch         =   -1  'True
      Top             =   3000
      Width           =   465
      Visible         =   0   'False
   End
   Begin VB.Label Lbl_Lvlhp4 
      BackColor       =   &H0000FF00&
      Height          =   105
      Left            =   4000
      TabIndex        =   38
      Top             =   6880
      Width           =   1995
      Visible         =   0   'False
   End
   Begin VB.Label Lbl_Lvlhp5 
      BackColor       =   &H000000FF&
      Height          =   105
      Left            =   4000
      TabIndex        =   47
      Top             =   6880
      Width           =   1995
      Visible         =   0   'False
   End
   Begin VB.Label lblTwrname 
      Alignment       =   2  'Center
      BackColor       =   &H00000000&
      Caption         =   "towername"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H8000000F&
      Height          =   375
      Left            =   3960
      TabIndex        =   46
      Top             =   6000
      Width           =   2295
      Visible         =   0   'False
   End
   Begin VB.Label lbls 
      BackColor       =   &H80000007&
      Caption         =   "Speed:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000040C0&
      Height          =   255
      Left            =   4920
      TabIndex        =   42
      Top             =   6860
      Width           =   855
      Visible         =   0   'False
   End
   Begin VB.Label lblae 
      BackColor       =   &H80000007&
      Caption         =   "ae"
      ForeColor       =   &H8000000A&
      Height          =   255
      Left            =   5640
      TabIndex        =   45
      Top             =   6555
      Width           =   495
      Visible         =   0   'False
   End
   Begin VB.Label lbla 
      BackColor       =   &H80000007&
      Caption         =   "Aoe:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000040C0&
      Height          =   255
      Left            =   5640
      TabIndex        =   44
      Top             =   6360
      Width           =   615
      Visible         =   0   'False
   End
   Begin VB.Label lblr 
      BackColor       =   &H80000007&
      Caption         =   "Range:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000040C0&
      Height          =   255
      Left            =   3840
      TabIndex        =   41
      Top             =   6860
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Label lblsdmg 
      BackColor       =   &H80000012&
      Caption         =   "Damage:"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000040C0&
      Height          =   195
      Left            =   4440
      TabIndex        =   40
      Top             =   6360
      Width           =   1095
      Visible         =   0   'False
   End
   Begin VB.Label LblKills 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00000000&
      Caption         =   "Kills"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6960
      TabIndex        =   25
      Top             =   6600
      Width           =   615
   End
   Begin VB.Label LblKillCount 
      BackColor       =   &H00000000&
      Caption         =   "Kills:"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H8000000C&
      Height          =   240
      Left            =   6435
      TabIndex        =   26
      Top             =   6600
      Width           =   465
   End
   Begin VB.Label LblLife 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00000000&
      Caption         =   "Life"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6990
      TabIndex        =   22
      Top             =   6840
      Width           =   615
   End
   Begin VB.Label LblLifeleft 
      BackColor       =   &H00000000&
      Caption         =   "Lives:"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00808080&
      Height          =   255
      Left            =   6435
      TabIndex        =   23
      Top             =   6840
      Width           =   495
   End
   Begin VB.Label lblGo 
      BackColor       =   &H00000000&
      Caption         =   "NEXT LVL!"
      BeginProperty Font 
         Name            =   "MS Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H000000C0&
      Height          =   255
      Left            =   6435
      TabIndex        =   39
      Top             =   7080
      Width           =   1095
   End
   Begin VB.Line Line21 
      BorderColor     =   &H80000015&
      BorderWidth     =   2
      X1              =   6345
      X2              =   6345
      Y1              =   6000
      Y2              =   7320
   End
   Begin VB.Image imgRange 
      Height          =   525
      Left            =   780
      Picture         =   "spel.frx":35812
      Stretch         =   -1  'True
      Top             =   5540
      Width           =   615
      Visible         =   0   'False
   End
   Begin VB.Shape shpAe 
      BackStyle       =   1  'Opaque
      BorderStyle     =   0  'Transparent
      FillColor       =   &H00FFFFFF&
      Height          =   975
      Index           =   0
      Left            =   9840
      Shape           =   3  'Circle
      Top             =   4200
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Image imgDmg 
      Height          =   525
      Left            =   60
      Picture         =   "spel.frx":36054
      Stretch         =   -1  'True
      Top             =   5520
      Width           =   615
      Visible         =   0   'False
   End
   Begin VB.Image imgbuild 
      Height          =   530
      Index           =   0
      Left            =   7900
      Picture         =   "spel.frx":369B7
      Stretch         =   -1  'True
      Top             =   5600
      Width           =   615
   End
   Begin VB.Label Lbl_Lvlhp3 
      BackColor       =   &H00000000&
      Caption         =   "/"
      ForeColor       =   &H0000FF00&
      Height          =   300
      Left            =   4960
      TabIndex        =   37
      Top             =   7050
      Width           =   135
      Visible         =   0   'False
   End
   Begin VB.Label LblDmg 
      BackColor       =   &H80000007&
      Caption         =   "Damage"
      ForeColor       =   &H80000000&
      Height          =   255
      Left            =   4440
      TabIndex        =   1
      Top             =   6555
      Width           =   975
      Visible         =   0   'False
   End
   Begin VB.Label Lbl_Lvlhp1 
      Alignment       =   1  'Right Justify
      BackColor       =   &H80000012&
      ForeColor       =   &H0000FF00&
      Height          =   375
      Left            =   4000
      TabIndex        =   34
      Top             =   7050
      Width           =   855
      Visible         =   0   'False
   End
   Begin VB.Label Lbl_Lvlhp2 
      BackColor       =   &H80000012&
      ForeColor       =   &H0000FF00&
      Height          =   375
      Left            =   5080
      TabIndex        =   35
      Top             =   7050
      Width           =   855
      Visible         =   0   'False
   End
   Begin VB.Image ImgBigtwr 
      Height          =   1160
      Left            =   2430
      Stretch         =   -1  'True
      Top             =   6000
      Width           =   1140
   End
   Begin VB.Label lblCash 
      Alignment       =   1  'Right Justify
      BackColor       =   &H80000012&
      Caption         =   "Cash"
      ForeColor       =   &H8000000A&
      Height          =   255
      Left            =   5760
      TabIndex        =   36
      Top             =   120
      Width           =   855
   End
   Begin VB.Image Img_meny 
      Height          =   300
      Left            =   3360
      Picture         =   "spel.frx":377C9
      Top             =   45
      Width           =   1560
   End
   Begin VB.Image Image7 
      Height          =   3015
      Left            =   9960
      Picture         =   "spel.frx":381C4
      Top             =   2760
      Width           =   75
   End
   Begin VB.Image Image6 
      Height          =   3015
      Left            =   9960
      Picture         =   "spel.frx":38863
      Top             =   0
      Width           =   75
   End
   Begin VB.Image Image5 
      Height          =   3015
      Left            =   0
      Picture         =   "spel.frx":38F02
      Top             =   2760
      Width           =   75
   End
   Begin VB.Image Image4 
      Height          =   3015
      Index           =   0
      Left            =   0
      Picture         =   "spel.frx":395A1
      Top             =   0
      Width           =   75
   End
   Begin VB.Image Image3 
      Height          =   75
      Left            =   -360
      Picture         =   "spel.frx":39C40
      Top             =   0
      Width           =   3615
   End
   Begin VB.Image Image2 
      Height          =   75
      Left            =   6840
      Picture         =   "spel.frx":3A38E
      Top             =   0
      Width           =   3615
   End
   Begin VB.Image Image1 
      Height          =   510
      Left            =   3240
      Picture         =   "spel.frx":3AADC
      Top             =   0
      Width           =   3615
   End
   Begin VB.Shape ShpRange 
      Height          =   255
      Left            =   9480
      Shape           =   3  'Circle
      Top             =   4080
      Width           =   255
      Visible         =   0   'False
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   19
      Left            =   2040
      TabIndex        =   21
      Top             =   -900
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   18
      Left            =   2040
      TabIndex        =   20
      Top             =   -1000
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   17
      Left            =   2040
      TabIndex        =   19
      Top             =   -1100
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   16
      Left            =   2040
      TabIndex        =   18
      Top             =   -1200
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   15
      Left            =   2040
      TabIndex        =   17
      Top             =   -1300
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   14
      Left            =   2040
      TabIndex        =   16
      Top             =   -1400
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   13
      Left            =   2040
      TabIndex        =   15
      Top             =   -1500
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   12
      Left            =   2040
      TabIndex        =   14
      Top             =   -1600
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   11
      Left            =   2040
      TabIndex        =   13
      Top             =   -1700
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   10
      Left            =   2040
      TabIndex        =   12
      Top             =   -1800
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   9
      Left            =   2040
      TabIndex        =   11
      Top             =   0
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   8
      Left            =   2040
      TabIndex        =   10
      Top             =   -200
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   7
      Left            =   2040
      TabIndex        =   9
      Top             =   -300
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   6
      Left            =   2040
      TabIndex        =   8
      Top             =   -400
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   5
      Left            =   2040
      TabIndex        =   7
      Top             =   -500
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   4
      Left            =   2040
      TabIndex        =   6
      Top             =   -600
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   3
      Left            =   2040
      TabIndex        =   5
      Top             =   -700
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   2
      Left            =   2040
      TabIndex        =   4
      Top             =   -800
      Width           =   500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   1
      Left            =   2040
      TabIndex        =   3
      Top             =   -1900
      Width           =   500
   End
   Begin VB.Line Line20 
      BorderColor     =   &H00000000&
      Index           =   0
      X1              =   9480
      X2              =   9480
      Y1              =   4320
      Y2              =   3720
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   255
      Index           =   0
      Left            =   2040
      TabIndex        =   0
      Top             =   -2000
      Width           =   500
   End
   Begin VB.Line Lin 
      Index           =   0
      X1              =   1920
      X2              =   1920
      Y1              =   0
      Y2              =   2280
   End
   Begin VB.Label LblKeep 
      Caption         =   "Label2"
      Height          =   375
      Left            =   240
      TabIndex        =   28
      Top             =   3840
      Width           =   855
      Visible         =   0   'False
   End
   Begin VB.Label LblTest 
      Caption         =   "Label2"
      Height          =   375
      Left            =   240
      TabIndex        =   27
      Top             =   3360
      Width           =   735
      Visible         =   0   'False
   End
   Begin VB.Label lblback1 
      BackColor       =   &H80000008&
      Height          =   1275
      Left            =   3840
      TabIndex        =   49
      Top             =   6030
      Width           =   3615
   End
   Begin VB.Image Image8 
      Height          =   1995
      Left            =   0
      Picture         =   "spel.frx":3C693
      Stretch         =   -1  'True
      Top             =   5400
      Width           =   10035
   End
   Begin VB.Label LblMsg 
      AutoSize        =   -1  'True
      BackColor       =   &H000000C0&
      Caption         =   "msg"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   72
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   1740
      Left            =   6840
      TabIndex        =   24
      Top             =   5400
      Width           =   3015
      Visible         =   0   'False
   End
   Begin VB.Image imgMobo 
      Height          =   1125
      Left            =   170
      Picture         =   "spel.frx":3FEA9
      Stretch         =   -1  'True
      Top             =   120
      Width           =   1605
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'VERSION 3.1
'buggfixad och försvårad sedan v3
'v3.0 var inlämnad till lärare, dock för lätt efter lvl 10. samt andra buggar
Option Explicit
Dim lineantal, labelwidth(20), code, e, alwlvl, stuck(20), mobolvl, delay(1000), find, i, X, Y, o, cash, frostmob(20), ae(1000), level1, range(1000), ver, UrLife, Kills, mob1(1000), keep(1000), showhp, hp, gone, nxtlvl, getcash, antal, current As Integer
Dim placera, buggfix, max, c, sell(1000), allowed(2) As Boolean
Dim mappath, ifallowed As String
Private Type twrlvl
    lvl As Integer
    type As String
    damage As Integer
    range As Integer
    frost As Boolean
    loaded As Boolean
    aoe As Integer
    money As Integer
    towertime As Integer
    towert As Integer
End Type
Dim twrlvl As twrlvl
Dim lvl(1000) As twrlvl
'clearar alla inforutor
Private Sub Form_Click()
current = 1001
Call clear
lbllvldmg.Caption = ""
lblTwrinf.Caption = ""
imgUpmobo.Visible = False
End Sub
'ger olika tangenter vissa funktioner
Private Sub Form_KeyDown(KeyCode As Integer, Shift As Integer)
 'gör att man kan nångra sig när man placerar ut torn utan extra kostnad
 If KeyCode = vbKeyC And placera = True Then
    walla = "bajs"
    ImgTwr1(antal).Visible = False
    ShpRange.Visible = False
    placera = False
    antal = antal - 1
    current = 1001
    
    Call clear
    
 ElseIf KeyCode = vbKeyC And placera = False Then
    ShpRange.Visible = False
    current = 1001
    
    Call clear
    'gör att man kan sälja torn
 ElseIf KeyCode = vbKeyS And placera = False And current <> 1001 Then
    cash = cash + Int(lvl(current).money * 0.75)
    lvl(current).money = 0
    lblCash = cash
'    ImgTwr1(current).Visible = False
    ImgTwr1(current).Left = 10000
    ImgTwr1(current).Top = 10000
    ShpRange.Visible = False
    placera = False
    sell(current) = True
    Call clear
ElseIf KeyCode = vbKeyPause Or KeyCode = vbKeyF10 Or KeyCode = vbKeyEscape Then
    Call menu
End If
End Sub
'placerar ut torn
Private Sub Form_MouseMove(Button As Integer, Shift As Integer, X As Single, Y As Single)
 If placera = True Then
        ImgTwr1(antal).Left = X - (ImgTwr1(antal).Width / 2)
        ImgTwr1(antal).Top = Y - (ImgTwr1(antal).Height / 2)
    
        End If
End Sub
'startar upp menyn genom knappen "Menu" i överkant
Private Sub Img_meny_Click()
Call menu
End Sub

Private Sub imgDmg_Click()
twrlvl.lvl = lvl(current).lvl + 1
twrlvl.type = lvl(current).type
Call findlvl

'följande if-sats gör att med mobo1 så är twrlvl-gränsen 3, mobo2 = 6 samt mobo3 = 8.
If mobolvl = 1 And lvl(current).lvl <= 2 Or mobolvl = 2 And lvl(current).lvl <= 5 Or mobolvl = 3 And lvl(current).lvl <= 7 Then
    If max = False And cash >= twrlvl.money Then
        cash = cash - twrlvl.money
        lblCash.Caption = cash
        lvl(current).damage = twrlvl.damage
        LblDmg.Caption = lvl(current).damage
        lvl(current).aoe = twrlvl.aoe
        lblae.Caption = lvl(current).aoe
        lvl(current).frost = twrlvl.frost
        lvl(current).lvl = lvl(current).lvl + 1
        lvl(current).towert = twrlvl.towert
        lblspeed.Caption = lvl(current).towert
        lvl(antal).money = lvl(antal).money + twrlvl.money
    End If
End If
'bestämmer vilket namn som visas i tornets namnruta, beroende på vvilken torntyp samt level på tornet
If lvl(current).frost = True Then
lblTwrname.Caption = "Frost Tower lvl " & lvl(current).lvl
ElseIf lvl(current).frost = False And lvl(current).aoe > 0 Then
lblTwrname.Caption = "Fire Tower lvl " & lvl(current).lvl
ElseIf lvl(current).frost = False And lvl(current).aoe = 0 Then
lblTwrname.Caption = "Lazer Tower lvl " & lvl(current).lvl
End If

max = False

End Sub
'visar upp information om vad man får på nästa lvl av det markerade tornet
Private Sub imgDmg_MouseMove(Button As Integer, Shift As Integer, X As Single, Y As Single)
twrlvl.lvl = lvl(current).lvl + 1
twrlvl.type = lvl(current).type
Call findlvl
'denna if-sats kollar ifall man kan uppgradera sitt torn utan att uppgradera moderkortet först, ifall det behövs så meddelas detta.
If mobolvl = 1 And lvl(current).lvl = 3 Then
        ifallowed = "You need to upgrade your motherboard first."
ElseIf mobolvl = 1 And 1 <= lvl(current).lvl <= 2 Then
        ifallowed = ""
ElseIf mobolvl = 2 And lvl(current).lvl = 6 Then
        ifallowed = "You need to upgrade your motherboard first."
ElseIf mobolvl = 2 And 1 <= lvl(current).lvl <= 5 Then
        ifallowed = ""
ElseIf mobolvl = 3 Then
        ifallowed = ""
End If
If max = False Then
    lbllvldmg.Caption = "Upgrade to level " & lvl(current).lvl + 1 & vbCrLf & "Cost: " & twrlvl.money & vbCrLf & "Damage: " & twrlvl.damage & vbCrLf & "Area of Effect: " & twrlvl.aoe & vbCrLf & ifallowed
ElseIf max = True Then
    lbllvldmg.Caption = "This tower is already fully upgraded." & vbCrLf & "Build more towers or upgrade another one instead."
End If
End Sub

'bestämmer samtliga värden för de tre olika torntyperna
'tid det tar mellan skotten, uppgraderingspris samt skada bestäms
Private Sub findlvl()

If twrlvl.type = "basic" Then
    'basic tower
    twrlvl.aoe = 0
    twrlvl.frost = False
    Select Case twrlvl.lvl
        Case 1
            twrlvl.towertime = 5
            twrlvl.damage = 10
            twrlvl.money = 10
        Case 2
            twrlvl.towertime = 5
            twrlvl.damage = 25
            twrlvl.money = 15
        Case 3
            twrlvl.towertime = 4
            twrlvl.damage = 50
            twrlvl.money = 30
        Case 4
            twrlvl.towertime = 3
            twrlvl.damage = 70
            twrlvl.money = 40
        Case 5
            twrlvl.towertime = 3
            twrlvl.damage = 100
            twrlvl.money = 50
        Case 6
            twrlvl.towertime = 3
            twrlvl.damage = 140
            twrlvl.money = 70
        Case 7
            twrlvl.towertime = 3
            twrlvl.damage = 200
            twrlvl.money = 100
        Case 8
            twrlvl.towertime = 2
            twrlvl.damage = 250
            twrlvl.money = 130
        Case 9
            max = True
    End Select
 
 'frost tower
ElseIf twrlvl.type = "frost" Then
    twrlvl.frost = True
    Select Case twrlvl.lvl
        Case 1
            twrlvl.damage = 20
            twrlvl.money = 30
            twrlvl.aoe = 0
            twrlvl.towertime = 80
        Case 2
            twrlvl.damage = 30
            twrlvl.money = 20
            twrlvl.aoe = 200
            twrlvl.towertime = 80
        Case 3
            twrlvl.damage = 40
            twrlvl.money = 40
            twrlvl.aoe = 300
            twrlvl.towertime = 70
        Case 4
            twrlvl.damage = 80
            twrlvl.money = 60
            twrlvl.aoe = 500
            twrlvl.towertime = 70
        Case 5
            twrlvl.damage = 100
            twrlvl.money = 80
            twrlvl.aoe = 600
            twrlvl.towertime = 60
        Case 6
            twrlvl.damage = 130
            twrlvl.money = 100
            twrlvl.aoe = 600
            twrlvl.towertime = 50
        Case 7
            twrlvl.damage = 160
            twrlvl.money = 160
            twrlvl.aoe = 800
            twrlvl.towertime = 40
        Case 8
            twrlvl.damage = 200
            twrlvl.money = 200
            twrlvl.aoe = 900
            twrlvl.towertime = 30
        Case 9
            max = True
    End Select
ElseIf twrlvl.type = "aoe" Then
    'aoe tower
    twrlvl.frost = False
    Select Case twrlvl.lvl
        Case 1
            twrlvl.damage = 200
            twrlvl.money = 40
            twrlvl.aoe = 600
            twrlvl.towertime = 60
        Case 2
            twrlvl.damage = 400
            twrlvl.money = 20
            twrlvl.aoe = 700
            twrlvl.towertime = 60
        Case 3
            twrlvl.damage = 600
            twrlvl.money = 50
            twrlvl.aoe = 700
            twrlvl.towertime = 50
        Case 4
            twrlvl.damage = 900
            twrlvl.money = 70
            twrlvl.aoe = 900
            twrlvl.towertime = 50
        Case 5
            twrlvl.damage = 1200
            twrlvl.money = 70
            twrlvl.aoe = 900
            twrlvl.towertime = 50
        Case 6
            twrlvl.damage = 1500
            twrlvl.money = 160
            twrlvl.aoe = 1000
            twrlvl.towertime = 40
        Case 7
            twrlvl.damage = 2000
            twrlvl.money = 300
            twrlvl.aoe = 1200
            twrlvl.towertime = 40
        Case 8
            twrlvl.damage = 2700
            twrlvl.money = 400
            twrlvl.aoe = 1400
            twrlvl.towertime = 30
        Case 9
            max = True
    End Select
End If
twrlvl.towert = twrlvl.towertime
End Sub
'visar upp information om sitt moderkort
Private Sub imgMobo_Click()
Dim upgradeable As String
imgUpmobo.Visible = True
If mobolvl = 1 Then
lblTwrname.Caption = "Gigabyte G31, lvl 1"
ElseIf mobolvl = 2 Then
lblTwrname.Caption = "Gigabyte P35, lvl 2"
ElseIf mobolvl = 3 Then
lblTwrname.Caption = "EVGA 680i, lvl 3"
End If
imgDmg.Visible = False
imgRange.Visible = False
LblDmg.Visible = False
LblRange.Visible = False
imgsdmg.Visible = False
lblsdmg.Visible = False
Lbl_Lvlhp1.Visible = False
Lbl_Lvlhp2.Visible = False
Lbl_Lvlhp3.Visible = False
Lbl_Lvlhp4.Visible = False
Lbl_Lvlhp5.Visible = False
lblr.Visible = False
lbls.Visible = False
lblspeed.Visible = False
lbla.Visible = False
lblae.Visible = False
lblTwrname.Visible = True
ImgBigtwr.Visible = False
If nxtlvl < 5 Then
upgradeable = "You will have to wait until level 5 to upgrade."
ElseIf nxtlvl >= 5 Then
upgradeable = ""
End If
lbllvldmg.Caption = "This is your motherboard, it determines which towers you can build and also how far they can be upgraded. " & upgradeable

End Sub
'placerar ut ett torn
Private Sub ImgTwr1_MouseMove(Index As Integer, Button As Integer, Shift As Integer, X As Single, Y As Single)
Dim tpleft As Integer
    Dim tpright As Integer
    If Index = antal And placera = True Then
        tpleft = ImgTwr1(antal).Left - (ImgTwr1(antal).Width / 2)
        tpright = ImgTwr1(antal).Top - (ImgTwr1(antal).Height / 2)
        tpleft = tpleft + X
        tpright = tpright + Y
        ImgTwr1(antal).Left = tpleft
        ImgTwr1(antal).Top = tpright
        LblKeep.Caption = X
        LblTest.Caption = Y
        End If
End Sub
'uppgraderar ditt moderkort så att du kan bygga nya torn eller uppgradera dem mera
Private Sub imgUpmobo_Click()
'kollar så att man har råd att uppgradera från mobo1 till mobo2
If cash >= 50 And mobolvl = 1 And nxtlvl >= 5 Then
Call clear
    cash = cash - 50
    imgMobo.Picture = imgP35.Picture
    lblCash = cash
    mobolvl = 2
    'tillåter aoe-tower
        allowed(2) = True
'kollar så att man har råd att uppgradera från mobo2 till mobo3
ElseIf cash >= 300 And mobolvl = 2 Then
    cash = cash - 300
    imgMobo.Picture = img680i.Picture
    lblCash = cash
    mobolvl = 3
End If
'uppdaterar inforutan
Call imgMobo_Click
End Sub
'ger en inforuta som visar vilket som är nästa moderkort, vad det gör samt priset
Private Sub imgUpmobo_MouseMove(Button As Integer, Shift As Integer, X As Single, Y As Single)
If mobolvl = 1 Then
lbllvldmg.Caption = "Upgrade your motherboard to a Gigabyte P35 for 50 g." & vbCrLf & "With P35 you can use the Fire Tower and upgrade your Lazer and Frost further."
ElseIf mobolvl = 2 Then
lbllvldmg.Caption = "Upgrade your motherboard to an EVGA 680i for 300 g." & vbCrLf & "You can upgrade all your towers to the max, but it comes with a cost."
End If
End Sub
'startar mobsen så att de går och bestämmer värden för olika levels
'livet påå fienderna och hur mycket man tjänar på att döda dem bestäms för varje level
Private Sub lblGo_Click()
If nxtlvl = 0 Then
    Timer1.Enabled = True
    Timer2.Enabled = True
    nxtlvl = nxtlvl + 1
    getcash = 1
    Call newlvl
ElseIf nxtlvl = 1 And gone = 20 Then
    hp = 0.5
    getcash = 1
    Call back
    Call newlvl
ElseIf nxtlvl = 2 And gone = 40 Then
    hp = 1
    getcash = 2
    Call back
    Call newlvl
ElseIf nxtlvl = 3 And gone = 60 Then
    Call back
    hp = 2
    getcash = 3
    Call newlvl
ElseIf nxtlvl = 4 And gone = 80 Then
    Call back
    hp = 3
    getcash = 4
    Call newlvl
ElseIf nxtlvl = 5 And gone = 100 Then
    Call back
    hp = 4
    getcash = 5
    Call newlvl
ElseIf nxtlvl = 6 And gone = 120 Then
    Call back
    hp = 6
    getcash = 6
    Call newlvl
ElseIf nxtlvl = 7 And gone = 140 Then
    Call back
    hp = 8
    getcash = 6
    Call newlvl
ElseIf nxtlvl = 8 And gone = 160 Then
    Call back
    hp = 10
    getcash = 7
    Call newlvl
ElseIf nxtlvl = 9 And gone = 180 Then
    Call back
    hp = 12
    getcash = 7
    Call newlvl
ElseIf nxtlvl = 10 And gone = 200 Then
    Call back
    hp = 15
    getcash = 8
    Call newlvl
ElseIf nxtlvl = 11 And gone = 220 Then
    hp = 18
    getcash = 8
    Call back
    Call newlvl
ElseIf nxtlvl = 12 And gone = 240 Then
    hp = 21
    getcash = 10
    Call back
    Call newlvl
ElseIf nxtlvl = 13 And gone = 260 Then
    Call back
    hp = 24
    getcash = 10
    Call newlvl
ElseIf nxtlvl = 14 And gone = 280 Then
    Call back
    hp = 29
    getcash = 12
    Call newlvl
ElseIf nxtlvl = 15 And gone = 300 Then
    Call back
    hp = 33
    getcash = 14
    Call newlvl
ElseIf nxtlvl = 16 And gone = 320 Then
    Call back
    hp = 40
    getcash = 16
    Call newlvl
ElseIf nxtlvl = 17 And gone = 340 Then
    Call back
    hp = 50
    getcash = 18
    Call newlvl
ElseIf nxtlvl = 18 And gone = 360 Then
    Call back
    hp = 60
    getcash = 20
    Call newlvl
ElseIf nxtlvl = 19 And gone = 380 Then
    Call back
    hp = 80
    getcash = 25
    Call newlvl
End If

End Sub
'ger en bonus på 20g inför varje level samt uppdaterar lite info
Private Sub newlvl()
cash = cash + 20
lblCash = cash
LblEarn.Caption = getcash & " g"
lblLvl.Caption = nxtlvl
End Sub
'skickar tillbaka mobsen till sina startpositioner inför en ny level
Private Sub back()
Dim i As Integer
    For i = 0 To 19
    Label1(i).Top = 0
    Label1(i).Left = lin(0).X1
    Label1(i).Width = 500
    labelwidth(i) = 500
    Label1(i).Top = Label1(i).Top - 100 * Int((Rnd * 70) + 1)
    Label1(i).Visible = True
    Label1(i).Enabled = True
    
    Next i
    nxtlvl = nxtlvl + 1
    Timer1.Enabled = True
    Timer2.Enabled = True
End Sub
'väljer svårighetsgrad med 1 liv
Private Sub CmdLife1_Click()
UrLife = 1
LblLife.Caption = UrLife
FraDiff.Visible = False
imgRange.Enabled = True
imgDmg.Enabled = True
lblGo.Enabled = True
For o = 0 To 2
imgbuild(o).Enabled = True
Next o
End Sub
'väljer svårighetsgrad med 10 liv
Private Sub CmdLife10_Click()
UrLife = 10
LblLife.Caption = UrLife
FraDiff.Visible = False
imgRange.Enabled = True
imgDmg.Enabled = True
lblGo.Enabled = True
For o = 0 To 2
imgbuild(o).Enabled = True
Next o
End Sub
'väljer svårighetsgrad med 20 liv samt att man börjar med 80 guld
Private Sub CmdLife20_Click()
UrLife = 20
LblLife.Caption = UrLife
FraDiff.Visible = False
imgRange.Enabled = True
imgDmg.Enabled = True
lblGo.Enabled = True
cash = 80
lblCash = cash
For o = 0 To 2
imgbuild(o).Enabled = True
Next o
End Sub
'väljer svårighetsgrad med 5 liv
Private Sub CmdLife5_Click()
UrLife = 5
LblLife.Caption = UrLife
FraDiff.Visible = False
imgRange.Enabled = True
imgDmg.Enabled = True
lblGo.Enabled = True
For o = 0 To 2
imgbuild(o).Enabled = True
Next o
End Sub

Private Sub imgRange_Click()
'kollar så att man har råd att uppgradera range
    If cash >= 100 Then
    'uppgraderar range, tar pengarna samt uppdaterar info
        range(current) = range(current) + 500
        cash = cash - 100
        lblCash.Caption = cash
        LblRange.Caption = range(current)
        'visar range
        ShpRange.Visible = True
        ShpRange.Top = ImgTwr1(current).Top + (ImgTwr1(current).Height / 2) - range(current)
        ShpRange.Left = ImgTwr1(current).Left + (ImgTwr1(current).Width / 2) - range(current)
        ShpRange.Width = range(current) * 2
        ShpRange.Height = range(current) * 2
    End If
End Sub

Private Sub Form_Load()
'frågar efter vilken karta man vill spela
mappath = InputBox("Choose the path to your mapfile:", "Choose map", "\txt\map1.txt")
'laddar kartan man har valt
Call loadmap
'laddar in de namn som finns i namnfilen, som man dessutom kan ändra i på egen hand
Call loadname
Dim i As Integer
For i = 0 To 1000
lvl(i).loaded = False
Next i

'delar ut lite färger
LblKillCount.BackColor = vbBlack
LblKills.BackColor = vbBlack
LblLife.BackColor = vbBlack
lblGo.BackColor = vbBlack

Dim iWidth As Integer, iHeight As Integer
'flyttar spelet till mitten av skärmen
iWidth = Screen.Width
iHeight = Screen.Height
Me.Top = iHeight / 2 - Me.Height / 2
Me.Left = iWidth / 2 - Me.Width / 2
Me.BorderStyle = 0

'mobben slumpas ut innom ett visst intervall.
Randomize
For i = 0 To 19
Label1(i).Top = 0
labelwidth(i) = 500
Label1(i).Top = Label1(i).Top - 100 * Int((Rnd * 70) + 1)
Label1(i).Left = lin(0).X1
Next i

ver = Int((Rnd * 9) + 4)
Form1.Caption = "WarCraft " & ver & " LabelTD"
lblLvl.Caption = 0

'ger meddelanderutan sin position då den är förminskad för enkelhetens skull när vi arbetar med spelet
LblMsg.Left = 2400
LblMsg.Top = 1920

Call Difficulty

'diverse variabler får default-värden
mobolvl = 1
keep(0) = 0
mob1(0) = 0
gone = 0
Kills = 0
hp = 0.3
showhp = 0.3
allowed(0) = True
allowed(1) = True
allowed(2) = False
LblEarn = 0
LblKills = Kills
LblLife.Caption = UrLife
range(current) = 1200
lvl(current).damage = 10
cash = 40
lblCash.Caption = cash

'ser till att man inte kan bygga torn eller starta spelet förrän man valt svårighetsgrad
lblGo.Enabled = False
For o = 0 To 2
imgbuild(o).Enabled = False
Next o

Line20(0).X1 = ImgTwr1(0).Left + (ImgTwr1(0).Width / 2)
Line20(0).X2 = ImgTwr1(0).Left + (ImgTwr1(0).Width / 2)
Line20(0).Y1 = ImgTwr1(0).Top + (ImgTwr1(0).Height / 2)
Line20(0).Y2 = ImgTwr1(0).Top + (ImgTwr1(0).Height / 2)
End Sub

'bygger torn
Private Sub Imgbuild_Click(Index As Integer)
twrlvl.lvl = 1
Select Case Index
Case 0
twrlvl.type = "basic"
Case 1
twrlvl.type = "frost"
Case 2
twrlvl.type = "aoe"
End Select

Call findlvl
'kollar så att man har råd med tornet samt ifall det är tillåtet att bygga
If cash >= twrlvl.money And allowed(Index) = True Then
If ImgTwr1(0).Visible = False Then
    current = 0
    antal = 0
    sell(antal) = False
ElseIf lvl(antal + 1).loaded = False Then
    antal = antal + 1
    Load ImgTwr1(antal)
    Load Line20(antal)
    Load shpAe(antal)
    lvl(antal).loaded = True
Else
antal = antal + 1
End If
    Select Case Index
        Case 0
        ImgTwr1(antal).Picture = imgPent.Picture
        lvl(antal).type = "basic"
        Case 1
        ImgTwr1(antal).Picture = imgQuad.Picture
        lvl(antal).type = "frost"
        Case 2
        ImgTwr1(antal).Picture = imgExt.Picture
        lvl(antal).type = "aoe"
        End Select
    placera = True
    ImgTwr1(antal).Left = imgbuild(Index).Left
    ImgTwr1(antal).Top = imgbuild(Index).Top
    lvl(antal).lvl = 1
    ImgTwr1(antal).Visible = True
    ImgTwr1(antal).ZOrder 0
    Line20(antal).ZOrder 0
    shpAe(antal).ZOrder 0
    Line20(antal).BorderColor = &HFFFFFF
    Line20(antal).Visible = True
    Line20(antal).X1 = 11111
    Line20(antal).X2 = 11111
    ImgTwr1(antal).Left = imgbuild(Index).Left
    ImgTwr1(antal).Top = imgbuild(Index).Top
    ImgTwr1(antal).Visible = True
    lvl(antal).towert = twrlvl.towert
    lvl(antal).damage = twrlvl.damage
    range(antal) = 1800
    lvl(antal).frost = twrlvl.frost
    lvl(antal).aoe = twrlvl.aoe
    lvl(antal).towertime = 1
    lvl(antal).lvl = 1
    lvl(antal).money = twrlvl.money
    current = antal
End If
End Sub

'visar tower status
Private Sub ImgTwr1_Click(Index As Integer)
current = Index
sell(current) = False
Dim b As Integer

'är tornet på vägen/menyn
If placera = True Then
    Dim a As Integer
    b = 0
        For a = 1 To lineantal
            If (ImgTwr1(current).Left + ImgTwr1(current).Width > lblback(a).Left And ImgTwr1(current).Top + ImgTwr1(current).Height > lblback(a).Top And ImgTwr1(current).Left + ImgTwr1(current).Width < lblback(a).Left + lblback(a).Width And ImgTwr1(current).Top + ImgTwr1(current).Height < lblback(a).Top + lblback(a).Height) Or (ImgTwr1(current).Left > lblback(a).Left And ImgTwr1(current).Top > lblback(a).Top And ImgTwr1(current).Left < lblback(a).Left + lblback(a).Width And ImgTwr1(current).Top < lblback(a).Top + lblback(a).Height) Or (ImgTwr1(current).Top + ImgTwr1(current).Height > Image8.Top) Or (ImgTwr1(current).Top < Image1.Top + Image1.Height And ImgTwr1(current).Left < Image1.Left + Image1.Width And ImgTwr1(current).Left + ImgTwr1(current).Width > Image1.Left) Then
                LblKeep = a
                b = a
            End If
        Next a
End If

'är tornet på andra torn
If b = 0 And placera = True Then
    For i = 0 To (antal - 1)
        If ImgTwr1(current).Left > ImgTwr1(i).Left - ImgTwr1(i).Width And ImgTwr1(current).Left < ImgTwr1(i).Left + ImgTwr1(i).Width And ImgTwr1(current).Top > ImgTwr1(i).Top - ImgTwr1(i).Height And ImgTwr1(current).Top < ImgTwr1(i).Top + ImgTwr1(i).Height Then
            b = 5
        End If
    Next i
End If

'placerar ut torn ifall det inte är på vägen/ torn/ meny
If b = 0 And placera = True Then
        placera = False
        cash = cash - twrlvl.money
    lblCash = cash
        Line20(current).X1 = ImgTwr1(current).Left + (ImgTwr1(current).Width / 2)
        Line20(current).X2 = ImgTwr1(current).Left + (ImgTwr1(current).Width / 2)
        Line20(current).Y1 = ImgTwr1(current).Top + (ImgTwr1(current).Height / 2)
        Line20(current).Y2 = ImgTwr1(current).Top + (ImgTwr1(current).Height / 2)
   
    End If


If b = 0 Then
LblDmg.Caption = lvl(current).damage
LblRange.Caption = range(current)
ImgBigtwr.Picture = ImgTwr1(Index).Picture

'visar range
ShpRange.Visible = True
ShpRange.Top = ImgTwr1(Index).Top + (ImgTwr1(Index).Height / 2) - range(current)
ShpRange.Left = ImgTwr1(Index).Left + (ImgTwr1(Index).Width / 2) - range(current)
ShpRange.Width = range(current) * 2
ShpRange.Height = range(current) * 2

'visar info om twr
lblspeed.Caption = lvl(current).towert
lblae.Caption = lvl(current).aoe

If lvl(current).frost = True Then
lblTwrname.Caption = "Frost Tower lvl " & lvl(current).lvl
lbllvldmg.Caption = "This is a Frost Tower which freezes your enemies. Upgrade it with the above icons."
ElseIf lvl(current).frost = False And lvl(current).aoe > 0 Then
lblTwrname.Caption = "Fire Tower lvl " & lvl(current).lvl
lbllvldmg.Caption = "This is a Fire Tower which does splashdamage and wounds several enemies at one time. Upgrade it with the above icons."
ElseIf lvl(current).frost = False And lvl(current).aoe = 0 Then
lblTwrname.Caption = "Lazer Tower lvl " & lvl(current).lvl
lbllvldmg.Caption = "This is a basic tower that shoots a laserbeam at a very high rate. Upgrade it with the above icons."
End If
imgDmg.Visible = True
imgRange.Visible = True
LblDmg.Visible = True
LblRange.Visible = True
imgsdmg.Visible = True
lblsdmg.Visible = True
Lbl_Lvlhp1.Visible = False
Lbl_Lvlhp2.Visible = False
Lbl_Lvlhp3.Visible = False
Lbl_Lvlhp4.Visible = False
Lbl_Lvlhp5.Visible = False
lblr.Visible = True
lbls.Visible = True
lblspeed.Visible = True
lbla.Visible = True
lblae.Visible = True
lblTwrname.Visible = True
imgUpmobo.Visible = False
ImgBigtwr.Visible = True
End If

End Sub

'visar en inforuta om den mob man markerat
Private Sub Label1_Click(Index As Integer)
showhp = Index
ShpRange.Visible = False
imgDmg.Visible = False
imgRange.Visible = False
LblDmg.Visible = False
LblRange.Visible = False
imgsdmg.Visible = False
lblsdmg.Visible = False
Lbl_Lvlhp1.Visible = True
Lbl_Lvlhp2.Visible = True
Lbl_Lvlhp3.Visible = True
Lbl_Lvlhp4.Visible = True
Lbl_Lvlhp5.Visible = True
lblr.Visible = False
lbls.Visible = False
lblspeed.Visible = False
lbla.Visible = False
lblae.Visible = False
lblTwrname.Caption = Label1(showhp).Caption
lblTwrname.Visible = True
Lbl_Lvlhp1.Caption = Label1(showhp).Width * hp
Lbl_Lvlhp2.Caption = 500 * hp
lbllvldmg.Caption = ""
lblTwrinf.Caption = ""
End Sub

'visar upp en kort instruktion bredvid menyn
Private Sub menuInst_Click()
frmMap.Height = 2700
frmMap.Width = 1815
frmMap.Top = 1080
frmMap.Left = 6120
lblInst.Caption = "Press 'c' when placing a tower to cancel. Press 's' to sell selected tower for 75%." & vbCrLf & "You may need to upgrade mobo for some towers. "
If frmMap.Visible = False Then
frmMap.Visible = True
ElseIf frmMap.Visible = True Then
frmMap.Visible = False
End If
End Sub

'styr mobsen och deras inforutor
Private Sub Timer1_Timer()
Call Motion
Call Fail
If Label1(showhp).Visible = True Then
Lbl_Lvlhp1.Caption = Label1(showhp).Width * hp
Lbl_Lvlhp4.Width = labelwidth(showhp) * 4
Lbl_Lvlhp2.Caption = 500 * hp
ElseIf Label1(showhp).Visible = False Then
Lbl_Lvlhp1.Caption = 0
Lbl_Lvlhp4.Visible = False
End If

End Sub
'styr hur mobsen går på banan
Private Sub Motion()
Dim speed As Integer
Dim mob As Integer
For mob = 0 To 19
If frostmob(mob) > 0 And (frostmob(mob) Mod 2) = 0 Then
speed = 0
frostmob(mob) = frostmob(mob) - 1
Label1(mob).BackColor = &HFFFF80
ElseIf frostmob(mob) > 0 Then
frostmob(mob) = frostmob(mob) - 1
Else
Label1(mob).BackColor = &H80&
speed = 20
End If

For i = 0 To lineantal
    If Label1(mob).Visible = True And ((Label1(mob).Left >= lin(i).X1 And Label1(mob).Left <= lin(i).X2) Or (Label1(mob).Left <= lin(i).X1 And Label1(mob).Left >= lin(i).X2)) And ((Label1(mob).Top >= lin(i).Y1 And Label1(mob).Top <= lin(i).Y2) Or (Label1(mob).Top <= lin(i).Y1 And Label1(mob).Top >= lin(i).Y2)) Then
        stuck(mob) = i
        If lin(i).Y1 < lin(i).Y2 Then
        Label1(mob).Top = Label1(mob).Top + speed
        ElseIf lin(i).Y1 > lin(i).Y2 Then
        Label1(mob).Top = Label1(mob).Top - speed
        ElseIf lin(i).X1 < lin(i).X2 Then
        Label1(mob).Left = Label1(mob).Left + speed
        ElseIf lin(i).X1 > lin(i).X2 Then
        Label1(mob).Left = Label1(mob).Left - speed
        End If
    End If
    
    
    
Next i
If Label1(mob).Top = lin(lineantal).Y2 And Label1(mob).Left = lin(lineantal).X2 Then
    Call Fail
        If Label1(mob).Visible = True Then
            UrLife = UrLife - 1
            LblLife = UrLife
            gone = gone + 1
        End If
        Label1(mob).Visible = False
    End If
    
Next mob

End Sub

'styr hur tornen skjuter
Private Sub towers()

For i = 0 To antal
If sell(i) = True Or (i = antal And placera = True) Then
Else

If delay(i) > 10 Then
shpAe(i).Visible = False

        Line20(i).X2 = Line20(i).X1
        Line20(i).Y2 = Line20(i).Y1
ElseIf delay(i) < 10 Then
delay(i) = delay(i) + 1
End If

If keep(i) = 1 Then
mob1(i) = mob1(i) - 1
End If

LblTest.Caption = mob1(i)

If Label1(mob1(i)).Visible = True And labelwidth(mob1(i)) >= 0 And range(i) > Math.Sqr((ImgTwr1(i).Top + (ImgTwr1(i).Height / 2) - Label1(mob1(i)).Top) ^ 2 + (ImgTwr1(i).Left + (ImgTwr1(i).Width / 2) - Label1(mob1(i)).Left) ^ 2) Then
        If lvl(i).towertime = 1 Then
        Line20(i).X2 = Label1(mob1(i)).Left
        Line20(i).Y2 = Label1(mob1(i)).Top
        End If
    If lvl(i).frost = False And lvl(i).aoe = 0 And Label1(mob1(i)).Visible = True And labelwidth(mob1(i)) * hp > lvl(i).damage Then
        If lvl(i).towertime = 1 Then
        labelwidth(mob1(i)) = (labelwidth(mob1(i)) * hp - lvl(i).damage) / hp
        Label1(mob1(i)).Width = labelwidth(mob1(i))
        End If
        keep(i) = 1
        LblKeep = keep(i)
    ElseIf lvl(i).frost = False And lvl(i).aoe > 0 And Label1(mob1(i)).Visible = True And labelwidth(mob1(i)) * hp > lvl(i).damage Then
        If lvl(i).towertime = 1 Then
        labelwidth(mob1(i)) = (labelwidth(mob1(i)) * hp - lvl(i).damage) / hp
        Label1(mob1(i)).Width = labelwidth(mob1(i))
        
        Dim findae As Integer
       Call aetower
        End If
        keep(i) = 1
        LblKeep = keep(i)
    ElseIf lvl(i).frost = True And Label1(mob1(i)).Visible = True And labelwidth(mob1(i)) * hp > lvl(i).damage Then
        If lvl(i).towertime = 1 Then
        labelwidth(mob1(i)) = (labelwidth(mob1(i)) * hp - lvl(i).damage) / hp
        Label1(mob1(i)).Width = labelwidth(mob1(i))
            If lvl(i).aoe > 0 Then
           Call aetower
            End If
        End If
        keep(i) = 1
        LblKeep = keep(i)
        frostmob(mob1(i)) = 50
    Else
        If lvl(i).towertime = 1 And lvl(i).aoe = 0 Then
        Label1(mob1(i)).Visible = False
        labelwidth(mob1(i)) = 0
        Label1(mob1(i)).Width = 0
        keep(i) = 0
        LblKeep = keep(i)
        Kills = Kills + 1
        LblKills.Caption = Kills
        gone = gone + 1
        cash = cash + getcash
        lblCash = cash
        
        ElseIf lvl(i).towertime = 1 And lvl(i).aoe > 0 Then
        Label1(mob1(i)).Visible = False
        labelwidth(mob1(i)) = 0
        Label1(mob1(i)).Width = 0
        keep(i) = 0
        LblKeep = keep(i)
        Kills = Kills + 1
        LblKills.Caption = Kills
        gone = gone + 1
        cash = cash + getcash
        lblCash = cash
        Call aetower
       Else
       keep(i) = 1
       LblKeep = keep(i)
       End If
    End If
Else
    Line20(i).X2 = Line20(i).X1
    Line20(i).Y2 = Line20(i).Y1
    keep(i) = 0
End If

mob1(i) = mob1(i) + 1
If mob1(i) >= 20 And keep(i) = 0 Then
mob1(i) = 0
End If

If lvl(i).towertime > 1 Then
lvl(i).towertime = lvl(i).towertime - 1
ElseIf lvl(i).towertime = 1 Then
delay(i) = 40
lvl(i).towertime = lvl(i).towert
End If

End If
Next i

End Sub
'styr de tre olika meddelanden som man får ifall 1. man failar, 2. man dödar samtliga mobs eller 3. man överlever
Private Sub Fail()
Dim failz As Integer
For failz = 0 To 19
If UrLife = 0 Then
    LblMsg.Caption = "Epic Fail!"
    LblMsg.BackColor = &HC0&
    LblMsg.ZOrder 0
    LblMsg.Visible = True
    Timer1.Enabled = False
    Timer2.Enabled = False
End If
Next failz
If Kills = 400 Then
LblMsg.Caption = "Extreme!"
LblMsg.BackColor = &HC00000
LblMsg.ZOrder 0
LblMsg.Visible = True
Timer1.Enabled = False
Timer2.Enabled = False
ElseIf gone = 400 And UrLife > 0 Then
LblMsg.Caption = "Victory!"
LblMsg.BackColor = &HC00000
LblMsg.ZOrder 0
LblMsg.Visible = True
Timer1.Enabled = False
Timer2.Enabled = False
End If

End Sub
'ger en ruta där man får välja svårighetsgrad
Private Sub Difficulty()
FraDiff.BackColor = &H808080
FraDiff.Left = 3700
FraDiff.Top = 900
FraDiff.Height = 3735
FraDiff.Width = 2895

End Sub
'styr tornen
Private Sub aetower()

shpAe(i).Visible = True
shpAe(i).Top = Label1(mob1(i)).Top + (Label1(mob1(i)).Height / 2) - lvl(i).aoe
shpAe(i).Left = Label1(mob1(i)).Left + (Label1(mob1(i)).Width / 2) - lvl(i).aoe
shpAe(i).Width = lvl(i).aoe * 2
shpAe(i).Height = lvl(i).aoe * 2

 Dim findae As Integer
 For findae = 0 To 19
     Dim apa As Double
     Dim apa2 As Double
     apa = Math.Sqr((Label1(mob1(i)).Top + (Label1(mob1(i)).Height / 2) - Label1(findae).Top) ^ 2 + (Label1(mob1(i)).Left + (labelwidth(mob1(i)) / 2) - Label1(findae).Left) ^ 2)
      apa2 = 1 - (apa / lvl(i).aoe)
      walla = apa2
        If findae <> mob1(i) And labelwidth(findae) * hp > (lvl(i).damage * apa2) And Label1(findae).Visible = True And labelwidth(findae) >= 0 And lvl(i).aoe > apa Then
            labelwidth(findae) = (labelwidth(findae) * hp - (lvl(i).damage * apa2)) / hp
            Label1(findae).Width = labelwidth(findae)
            If lvl(i).frost = True Then
            frostmob(findae) = 50
            End If
        ElseIf findae <> mob1(i) And labelwidth(findae) * hp <= (lvl(i).damage * apa2) And Label1(findae).Visible = True And labelwidth(findae) >= 0 And lvl(i).aoe > apa Then
            labelwidth(findae) = 0
            Label1(findae).Visible = False
            Kills = Kills + 1
            LblKills.Caption = Kills
            gone = gone + 1
            cash = cash + getcash
            lblCash = cash
        End If
        Next findae

End Sub
'styr hur tornen skjuter
Private Sub Timer2_Timer()
Call towers
End Sub
'stänger ned inforutor, namnrutor etc.
Private Sub clear()
    ShpRange.Visible = False
    imgDmg.Visible = False
    imgRange.Visible = False
    LblDmg.Visible = False
    LblRange.Visible = False
    imgsdmg.Visible = False
    lblsdmg.Visible = False
    Lbl_Lvlhp1.Visible = False
    Lbl_Lvlhp2.Visible = False
    Lbl_Lvlhp3.Visible = False
    Lbl_Lvlhp4.Visible = False
    Lbl_Lvlhp5.Visible = False
    lblr.Visible = False
    lbls.Visible = False
    lblspeed.Visible = False
    lbla.Visible = False
    lblae.Visible = False
    lblTwrname.Visible = False
    ImgBigtwr.Visible = False
End Sub
'visar lite info när man håller över knappen för bygga ett nytt torn
Private Sub imgbuild_MouseMove(Index As Integer, Button As Integer, Shift As Integer, X As Single, Y As Single)
Call findlvl
Select Case Index
Case 0
lblTwrinf.Caption = "Build a Lazer Tower" & vbCrLf & "Cost: 10" & vbCrLf & "This tower shoots a laserbeam at the mobs. Shoots one mob at a time."
Case 1
lblTwrinf.Caption = "Build a Frost Tower" & vbCrLf & "Cost: 30" & vbCrLf & "This tower freezes the mobs and can be upgraded with AoE. It can freeze the mobs totally until they die too."
Case 2
lblTwrinf.Caption = "Build a Fire Tower" & vbCrLf & "Cost: 40" & vbCrLf & "This is an expensive AoE-tower and it's throwing bombs at the mobs. This needs a P35 mobo."
End Select
End Sub
'visar lite info när man håller över knappen för att uppgradera tornens räckvidd
Private Sub imgRange_MouseMove(Button As Integer, Shift As Integer, X As Single, Y As Single)
lbllvldmg.Caption = "Upgrade towers range" & vbCrLf & "Cost: 100" & vbCrLf & "Range: " & range(current) + 500
End Sub
'öppnar upp samt flyttar en frame med menyn till mitten
Private Sub menu()
    frmMenu.Visible = True
    frmMenu.Left = 4200
    frmMenu.Top = 1080
    frmMenu.Height = 2700
    frmMenu.Width = 1815
End Sub
'laddar in en extern karta
Private Sub loadmap()
Dim textline As String
Dim linenum As Integer
Dim max_bricks As Integer
'laddar den karta man valde när spelet startas, mappath är sökvägen man skriver
    Open App.Path & mappath For Input As #1
    
    Do While Not EOF(1)
        Line Input #1, textline
        
        If linenum > 4 Then
        linenum = 1
        lineantal = lineantal + 1
        End If
        
        Select Case linenum
            Case 0
                max_bricks = Val(textline)
            Case 1
            If lineantal > 0 Then
                Load lin(lineantal)
                Load lblback(lineantal)
            End If
                lin(lineantal).Visible = True
                lblback(lineantal).Visible = True
                lblback(lineantal).ZOrder 1
                lin(lineantal).ZOrder 0
                lin(lineantal).Visible = False
                lin(lineantal).X1 = Val(textline)
            Case 2
                lin(lineantal).X2 = Val(textline)
            Case 3
                lin(lineantal).Y1 = Val(textline)
            Case 4
                lin(lineantal).Y2 = Val(textline)
        End Select
        If lin(lineantal).X1 < lin(lineantal).X2 And lin(lineantal).Y1 = lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X1 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = lin(lineantal).X2 - lin(lineantal).X1 + 700
        lblback(lineantal).Height = 700
        ElseIf lin(lineantal).X1 > lin(lineantal).X2 And lin(lineantal).Y1 = lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = lin(lineantal).X1 - lin(lineantal).X2 + 700
        lblback(lineantal).Height = 700
        ElseIf lin(lineantal).X1 = lin(lineantal).X2 And lin(lineantal).Y1 < lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y1 - 250
        lblback(lineantal).Width = 700
        lblback(lineantal).Height = lin(lineantal).Y2 - lin(lineantal).Y1 + 300
        ElseIf lin(lineantal).X1 = lin(lineantal).X2 And lin(lineantal).Y1 > lin(lineantal).Y2 Then
        lblback(lineantal).Left = lin(lineantal).X2 - 100
        lblback(lineantal).Top = lin(lineantal).Y2 - 250
        lblback(lineantal).Width = 700
        lblback(lineantal).Height = lin(lineantal).Y1 - lin(lineantal).Y2 + 300
        
        End If
        
        linenum = linenum + 1
        
    Loop
    Close #1
End Sub
Private Sub loadname()

Dim textline As String
Dim linenum As Integer
Dim max_bricks As Integer
Dim have(19) As Boolean
Dim o As Integer
    
'laddar in namn från en textfil och slumpar vilket mob som får vilket namn
    For o = 0 To 19
Do
    Open App.Path & "\txt\names.txt" For Input As #1
    Do While Not EOF(1)
        Line Input #1, textline
        i = Int(Rnd * 20)
        If have(i) = False And linenum Then
        have(i) = True
        Label1(i).Caption = textline
        End If
        linenum = linenum + 1
    Loop
    Close #1
Loop Until have(o) = True
Next o
End Sub
'ett litet fusk som aktiveras genoma Att man trycker på någon av pixlarna i spelets övre vänsterhörn
Private Sub imgcheat_click()
cash = cash + 100
lblCash = cash
End Sub
'stänger av programmet
Private Sub menuExit_Click()
End
End Sub
'går tillbaka till spelet
Private Sub menuBack_Click()
frmMenu.Visible = False
frmMap.Visible = False
End Sub
'öppnar våran map-editor där man kan bygga sina egna banor
Private Sub menuMapedit_Click()
Form1.Enabled = False
Form1.Visible = False
Form2.Enabled = True
Form2.Visible = True
End Sub
